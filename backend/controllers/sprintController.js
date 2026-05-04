const Sprint = require("../models/Sprint");
const Task = require("../models/Task");
const Project = require("../models/Project");

async function getAccessibleProjectIds(user) {
  if (user.role === "Admin") return null;
  let filter = {};
  if (user.role === "Manager") {
    filter.$or = [{ manager: user._id }, { members: user._id }];
  } else {
    filter.members = user._id;
  }
  const projects = await Project.find(filter).select("_id");
  return projects.map((p) => p._id);
}

exports.getSprints = async (req, res) => {
  try {
    const { project, status } = req.query;
    let filter = {};
    if (project) filter.project = project;
    if (status) filter.status = status;

    if (req.user.role !== "Admin") {
      const ids = await getAccessibleProjectIds(req.user);
      if (filter.project) {
        const allowed = ids.map((id) => id.toString());
        if (!allowed.includes(filter.project)) return res.json([]);
      } else {
        filter.project = { $in: ids };
      }
    }
    const sprints = await Sprint.find(filter)
      .populate("project", "title")
      .sort({ startDate: -1 });
    const sprintsWithStats = await Promise.all(
      sprints.map(async (s) => {
        const tasks = await Task.find({ sprint: s._id });
        const todo = tasks.filter((t) => t.status === "To Do").length;
        const inProgress = tasks.filter((t) => t.status === "In Progress").length;
        const done = tasks.filter((t) => t.status === "Done").length;
        const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
        return {
          ...s.toObject(),
          tasks: { total: tasks.length, todo, inProgress, completed: done },
          progress,
        };
      })
    );
    res.json(sprintsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id).populate("project", "title");
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });
    const tasks = await Task.find({ sprint: sprint._id }).populate("assignedTo", "name");
    const todo = tasks.filter((t) => t.status === "To Do").length;
    const inProgress = tasks.filter((t) => t.status === "In Progress").length;
    const done = tasks.filter((t) => t.status === "Done").length;
    res.json({
      ...sprint.toObject(),
      tasks: { total: tasks.length, todo, inProgress, completed: done },
      progress: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
      taskList: tasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSprint = async (req, res) => {
  try {
    const sprint = await Sprint.create(req.body);
    const populated = await Sprint.findById(sprint._id).populate("project", "title");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("project", "title");
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });
    res.json(sprint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndDelete(req.params.id);
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });
    res.json({ message: "Sprint deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
