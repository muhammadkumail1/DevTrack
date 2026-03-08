const Task = require("../models/Task");

exports.getTasks = async (req, res) => {
  try {
    const { project, sprint, status, assignedTo } = req.query;
    let filter = {};
    if (project) filter.project = project;
    if (sprint) filter.sprint = sprint;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    const tasks = await Task.find(filter)
      .populate("project", "title")
      .populate("sprint", "name")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "title")
      .populate("sprint", "name")
      .populate("assignedTo", "name email");
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    const populated = await Task.findById(task._id)
      .populate("project", "title")
      .populate("sprint", "name")
      .populate("assignedTo", "name email");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("project", "title")
      .populate("sprint", "name")
      .populate("assignedTo", "name email");
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("project", "title")
      .populate("sprint", "name")
      .populate("assignedTo", "name email");
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
