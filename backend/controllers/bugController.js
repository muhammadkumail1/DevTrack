const Bug = require("../models/Bug");

exports.getBugs = async (req, res) => {
  try {
    const { project, severity, status, assignedTo } = req.query;
    let filter = {};
    if (project) filter.project = project;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    const bugs = await Bug.find(filter)
      .populate("project", "title")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });
    res.json(bugs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id)
      .populate("project", "title")
      .populate("assignedTo", "name email");
    if (!bug) return res.status(404).json({ message: "Bug not found" });
    res.json(bug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBug = async (req, res) => {
  try {
    const bug = await Bug.create(req.body);
    const populated = await Bug.findById(bug._id)
      .populate("project", "title")
      .populate("assignedTo", "name email");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBug = async (req, res) => {
  try {
    const bug = await Bug.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("project", "title")
      .populate("assignedTo", "name email");
    if (!bug) return res.status(404).json({ message: "Bug not found" });
    res.json(bug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.closeBug = async (req, res) => {
  try {
    const bug = await Bug.findByIdAndUpdate(
      req.params.id,
      { status: "Closed" },
      { new: true }
    )
      .populate("project", "title")
      .populate("assignedTo", "name email");
    if (!bug) return res.status(404).json({ message: "Bug not found" });
    res.json(bug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBug = async (req, res) => {
  try {
    const bug = await Bug.findByIdAndDelete(req.params.id);
    if (!bug) return res.status(404).json({ message: "Bug not found" });
    res.json({ message: "Bug deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
