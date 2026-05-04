const Project = require("../models/Project");
const Task = require("../models/Task");
const Bug = require("../models/Bug");
const Sprint = require("../models/Sprint");
const Milestone = require("../models/Milestone");
const User = require("../models/User");

exports.getProjects = async (req, res) => {
  try {
    const { status, search } = req.query;

    // Build the final filter using $and so search + membership scope never conflict
    const conditions = [];

    if (status) conditions.push({ status });

    if (search) {
      conditions.push({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      });
    }

    // Scope by role — Admin sees all; everyone else only their projects
    if (req.user.role !== "Admin") {
      if (req.user.role === "Manager") {
        // Manager sees projects where they are the designated manager OR an added member
        conditions.push({ $or: [{ manager: req.user._id }, { members: req.user._id }] });
      } else {
        // Developer / Tester / any other role — must be an explicitly added member
        conditions.push({ members: req.user._id });
      }
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};

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

    // Enforce membership: non-Admins must be manager or a member
    if (req.user.role !== "Admin") {
      const isManager = project.manager?._id?.toString() === req.user._id.toString();
      const isMember  = (project.members || []).some((m) => m._id.toString() === req.user._id.toString());
      if (!isManager && !isMember) {
        return res.status(403).json({ message: "You are not a member of this project." });
      }
    }

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

    // Enforce membership: non-Admins must be manager or a member
    if (req.user.role !== "Admin") {
      const isManager = project.manager?._id?.toString() === req.user._id.toString();
      const isMember  = (project.members || []).some((m) => m._id.toString() === req.user._id.toString());
      if (!isManager && !isMember) {
        return res.status(403).json({ message: "You are not a member of this project." });
      }
    }

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

    // Include manager + members in workload (deduplicated)
    const teamMap = {};
    if (project.manager) teamMap[project.manager._id.toString()] = { ...project.manager.toObject(), projectRole: 'Manager' };
    (project.members || []).forEach((m) => {
      if (!teamMap[m._id.toString()]) teamMap[m._id.toString()] = { ...m.toObject(), projectRole: m.role };
    });

    const memberWorkload = Object.values(teamMap).map((member) => {
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
    let health = "On Track";
    if (progress === 100) health = "Completed";
    else if (openBugs > 5 || progress < 30) health = "Off Track";
    else if (openBugs > 2 || progress < 60) health = "At Risk";

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
    const existing = await Project.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Project not found" });
    // Managers may only edit projects they own; Admins may edit any.
    if (req.user.role === "Manager" && existing.manager?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit projects you manage." });
    }

    // Sanitise members: extract _id if client sent populated objects instead of bare IDs
    const body = { ...req.body };
    if (Array.isArray(body.members)) {
      body.members = body.members.map((m) =>
        m && typeof m === "object" && m._id ? m._id : m
      );
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    )
      .populate("manager", "name email")
      .populate("members", "name email");
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.archiveProject = async (req, res) => {
  try {
    const existing = await Project.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Project not found" });
    if (req.user.role === "Manager" && existing.manager?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only archive projects you manage." });
    }
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: "Archived" },
      { new: true }
    )
      .populate("manager", "name email")
      .populate("members", "name email");
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    // Only Admin may delete projects (hard delete is destructive)
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Only Admins can delete projects." });
    }
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /projects/:id/members — returns the member list for a project
exports.getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("manager", "name email role")
      .populate("members", "name email role");
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Enforce membership: non-Admins must be manager or a member
    if (req.user.role !== "Admin") {
      const isManager = project.manager?._id?.toString() === req.user._id.toString();
      const isMember  = (project.members || []).some((m) => m._id.toString() === req.user._id.toString());
      if (!isManager && !isMember) {
        return res.status(403).json({ message: "You are not a member of this project." });
      }
    }

    // Combine manager + members, deduplicate
    const memberMap = {};
    if (project.manager) memberMap[project.manager._id.toString()] = project.manager;
    (project.members || []).forEach((m) => { memberMap[m._id.toString()] = m; });
    res.json(Object.values(memberMap));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /projects/:id/members/add
exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Only manager of this project or Admin can add members
    if (req.user.role !== "Admin" && project.manager?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the project manager or Admin can manage members." });
    }

    if (!project.members.map((m) => m.toString()).includes(userId)) {
      project.members.push(userId);
      await project.save();
    }

    const populated = await Project.findById(project._id)
      .populate("manager", "name email role")
      .populate("members", "name email role");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /projects/:id/members/remove
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (req.user.role !== "Admin" && project.manager?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the project manager or Admin can manage members." });
    }

    project.members = project.members.filter((m) => m.toString() !== userId);
    await project.save();

    const populated = await Project.findById(project._id)
      .populate("manager", "name email role")
      .populate("members", "name email role");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
