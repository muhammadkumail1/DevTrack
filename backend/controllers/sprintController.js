const Sprint = require("../models/Sprint");
const Task = require("../models/Task");

exports.getSprints = async (req, res) => {
  try {
    const { project, status } = req.query;
    let filter = {};
    if (project) filter.project = project;
    if (status) filter.status = status;
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
