const WorkLog = require("../models/WorkLog");

exports.getWorkLogs = async (req, res) => {
  try {
    const { user, task, project } = req.query;
    let filter = {};
    if (user) filter.user = user;
    if (task) filter.task = task;
    if (project) {
      const Task = require("../models/Task");
      const tasks = await Task.find({ project }).select("_id");
      filter.task = { $in: tasks.map((t) => t._id) };
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
