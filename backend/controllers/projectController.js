const Project = require("../models/Project");
const Task = require("../models/Task");
const Bug = require("../models/Bug");
const Sprint = require("../models/Sprint");
const Milestone = require("../models/Milestone");

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

exports.getProjectOverview = async (req, res) => {
  try {
    console.log('Fetching project overview for ID:', req.params.id);
    const project = await Project.findById(req.params.id)
      .populate("manager", "name email role")
      .populate("members", "name email role");
    if (!project) return res.status(404).json({ message: "Project not found" });

    const [tasks, bugs, sprints, milestones] = await Promise.all([
      Task.find({ project: project._id }).populate("assignedTo", "name"),
      Bug.find({ project: project._id }).populate("assignedTo", "name"),
      Sprint.find({ project: project._id }),
      Milestone.find({ project: project._id }),
    ]);

    console.log('Loaded data - tasks:', tasks.length, 'bugs:', bugs.length, 'sprints:', sprints.length, 'milestones:', milestones.length);

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t) => t.status === "Done").length;
    const inProgressTasks = tasks.filter((t) => t.status === "In Progress").length;
    const todoTasks = tasks.filter((t) => t.status === "To Do").length;
    const openBugs = bugs.filter((b) => b.status !== "Closed").length;
    const criticalBugs = bugs.filter((b) => b.severity === "Critical" && b.status !== "Closed").length;
    const completedMilestones = milestones.filter((m) => m.status === "Completed" || m.status === "Approved").length;
    const activeSprint = sprints.find((s) => s.status === "Active") || null;
    const recentTasks = tasks
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    const memberWorkload = (project.members || []).map((member) => {
      const assigned = tasks.filter(
        (t) => t.assignedTo && t.assignedTo._id.toString() === member._id.toString()
      );
      const completed = assigned.filter((t) => t.status === "Done").length;
      return {
        user: member,
        total: assigned.length,
        done: completed,
        inProgress: assigned.filter((t) => t.status === "In Progress").length,
        progress: assigned.length ? Math.round((completed / assigned.length) * 100) : 0,
      };
    });

    const now = new Date();
    const daysRemaining = project.endDate
      ? Math.max(0, Math.ceil((new Date(project.endDate) - now) / (1000 * 60 * 60 * 24)))
      : null;
    const progress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const spi = totalTasks ? Number((doneTasks / totalTasks).toFixed(2)) : 1;
    let health = "Healthy";
    if (openBugs > 5 || progress < 40) health = "At Risk";
    else if (openBugs > 2 || progress < 70) health = "Needs Attention";

    res.json({
      project,
      health,
      spi,
      daysRemaining,
      stats: {
        totalTasks,
        doneTasks,
        inProgressTasks,
        todoTasks,
        openBugs,
        criticalBugs,
        completedMilestones,
        totalMilestones: milestones.length,
        totalSprints: sprints.length,
        progress,
      },
      activeSprint,
      recentTasks,
      memberWorkload,
    });
  } catch (error) {
    console.error('Error in getProjectOverview:', error);
    res.status(500).json({ message: error.message, details: error.stack });
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
