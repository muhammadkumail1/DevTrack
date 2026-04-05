const Project = require("../models/Project");
const Task = require("../models/Task");
const Bug = require("../models/Bug");
const Sprint = require("../models/Sprint");
const WorkLog = require("../models/WorkLog");

exports.getDashboardStats = async (req, res) => {
  try {
    const projects = await Project.find();
    const activeProjects = projects.filter((p) => p.status === "Active").length;
    const tasks = await Task.find();
    const inProgress = tasks.filter((t) => t.status === "In Progress").length;
    const completed = tasks.filter((t) => t.status === "Done").length;
    const bugs = await Bug.find();
    const openBugs = bugs.filter((b) => b.status !== "Closed" && b.status !== "Resolved").length;
    const criticalBugs = bugs.filter((b) => b.severity === "Critical" && b.status !== "Closed").length;

    res.json({
      activeProjects,
      activeTasks: inProgress,
      completedTasks: completed,
      openBugs,
      criticalBugs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectProgress = async (req, res) => {
  try {
    const projects = await Project.find({ status: { $ne: "Archived" } })
      .populate("manager", "name")
      .populate("members", "name");
    const result = await Promise.all(
      projects.map(async (p) => {
        const tasks = await Task.find({ project: p._id });
        const bugs = await Bug.find({ project: p._id });
        const completed = tasks.filter((t) => t.status === "Done").length;
        const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
        return {
          _id: p._id,
          title: p.title,
          description: p.description,
          status: p.status,
          progress,
          tasksTotal: tasks.length,
          tasksCompleted: completed,
          bugsCount: bugs.length,
          manager: p.manager,
          members: p.members,
          endDate: p.endDate,
        };
      })
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectReport = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId)
      .populate("manager", "name email")
      .populate("members", "name email");
    if (!project) return res.status(404).json({ message: "Project not found" });

    const tasks = await Task.find({ project: projectId }).populate("assignedTo", "name");
    const bugs = await Bug.find({ project: projectId }).populate("assignedTo", "name");
    const sprints = await Sprint.find({ project: projectId });
    const workLogs = await WorkLog.find({
      task: { $in: tasks.map((t) => t._id) },
    }).populate("user", "name");

    const completed = tasks.filter((t) => t.status === "Done").length;
    const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

    const taskByStatus = {
      toDo: tasks.filter((t) => t.status === "To Do").length,
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
      done: completed,
    };

    const bugBySeverity = {
      Minor: bugs.filter((b) => b.severity === "Minor").length,
      Major: bugs.filter((b) => b.severity === "Major").length,
      Critical: bugs.filter((b) => b.severity === "Critical").length,
    };

    const teamWorkload = {};
    tasks.forEach((t) => {
      if (t.assignedTo) {
        const name = t.assignedTo.name;
        if (!teamWorkload[name]) teamWorkload[name] = { total: 0, done: 0 };
        teamWorkload[name].total++;
        if (t.status === "Done") teamWorkload[name].done++;
      }
    });

    res.json({
      project,
      progress,
      tasks: { total: tasks.length, ...taskByStatus, list: tasks },
      bugs: { total: bugs.length, bySeverity: bugBySeverity, list: bugs },
      sprints,
      workLogs,
      teamWorkload: Object.entries(teamWorkload).map(([name, data]) => ({
        name,
        ...data,
        progress: data.total ? Math.round((data.done / data.total) * 100) : 0,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSprintVelocity = async (req, res) => {
  try {
    const sprints = await Sprint.find({ status: "Completed" })
      .populate("project", "title")
      .sort({ endDate: 1 });
    const result = await Promise.all(
      sprints.map(async (s) => {
        const tasks = await Task.find({ sprint: s._id });
        const completed = tasks.filter((t) => t.status === "Done").length;
        return {
          _id: s._id,
          name: s.name,
          velocity: completed,
          project: s.project,
        };
      })
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTeamPerformance = async (req, res) => {
  try {
    const User = require("../models/User");
    const users = await User.find().select("name role");
    const result = await Promise.all(
      users.map(async (u) => {
        const tasks = await Task.find({ assignedTo: u._id });
        const completed = tasks.filter((t) => t.status === "Done").length;
        const bugs = await Bug.find({ assignedTo: u._id });
        const openBugs = bugs.filter((b) => b.status !== "Closed").length;
        const workLogs = await WorkLog.find({ user: u._id });
        const totalHours = workLogs.reduce((sum, w) => sum + w.hours, 0);
        return {
          _id: u._id,
          name: u.name,
          role: u.role,
          tasksCompleted: completed,
          bugsAssigned: bugs.length,
          openBugs,
          totalHours,
        };
      })
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
