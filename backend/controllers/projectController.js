const Project = require("../models/Project");
const Task = require("../models/Task");
const Bug = require("../models/Bug");

exports.getProjects = async (req, res) => {
  try {
    const { status, search } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    const projects = await Project.find(filter)
      .populate("manager", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });
    const projectsWithStats = await Promise.all(
      projects.map(async (p) => {
        const tasks = await Task.find({ project: p._id });
        const bugs = await Bug.find({ project: p._id });
        const completed = tasks.filter((t) => t.status === "Done").length;
        const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
        return {
          ...p.toObject(),
          progress,
          tasksTotal: tasks.length,
          tasksCompleted: completed,
          bugsCount: bugs.length,
        };
      })
    );
    res.json(projectsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("manager", "name email")
      .populate("members", "name email");
    if (!project) return res.status(404).json({ message: "Project not found" });
    const tasks = await Task.find({ project: project._id });
    const bugs = await Bug.find({ project: project._id });
    const completed = tasks.filter((t) => t.status === "Done").length;
    res.json({
      ...project.toObject(),
      progress: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
      tasksTotal: tasks.length,
      tasksCompleted: completed,
      bugsCount: bugs.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      manager: req.user._id,
      members: req.body.members || [req.user._id],
    });
    const populated = await Project.findById(project._id)
      .populate("manager", "name email")
      .populate("members", "name email");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate("manager", "name email")
      .populate("members", "name email");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.archiveProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: "Archived" },
      { new: true }
    )
      .populate("manager", "name email")
      .populate("members", "name email");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
