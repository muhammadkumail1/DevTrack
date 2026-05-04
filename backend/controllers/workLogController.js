const WorkLog = require("../models/WorkLog");
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

exports.getWorkLogs = async (req, res) => {
  try {
    const { user, task, project } = req.query;
    let filter = {};
    if (user) filter.user = user;
    if (task) filter.task = task;

    // Resolve tasks within accessible projects
    const Task = require("../models/Task");
    if (project) {
      // Check if user has access to requested project
      if (req.user.role !== "Admin") {
        const ids = await getAccessibleProjectIds(req.user);
        if (!ids.map((id) => id.toString()).includes(project)) return res.json([]);
      }
      const tasks = await Task.find({ project }).select("_id");
      filter.task = { $in: tasks.map((t) => t._id) };
    } else if (req.user.role !== "Admin") {
      // Scope to accessible project tasks
      const ids = await getAccessibleProjectIds(req.user);
      const tasks = await Task.find({ project: { $in: ids } }).select("_id");
      filter.task = { $in: tasks.map((t) => t._id) };
      // Developers: also restrict to own logs
      if (req.user.role !== "Manager") {
        filter.user = req.user._id;
      }
    }

    const workLogs = await WorkLog.find(filter)
      .populate("user", "name email")
      .populate("task", "title")
      .sort({ date: -1 });
    res.json(workLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createWorkLog = async (req, res) => {
  try {
    const workLog = await WorkLog.create({
      ...req.body,
      user: req.body.user || req.user._id,
    });
    const populated = await WorkLog.findById(workLog._id)
      .populate("user", "name email")
      .populate("task", "title");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateWorkLog = async (req, res) => {
  try {
    const workLog = await WorkLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("user", "name email")
      .populate("task", "title");
    if (!workLog) return res.status(404).json({ message: "Work log not found" });
    res.json(workLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteWorkLog = async (req, res) => {
  try {
    const workLog = await WorkLog.findByIdAndDelete(req.params.id);
    if (!workLog) return res.status(404).json({ message: "Work log not found" });
    res.json({ message: "Work log deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
