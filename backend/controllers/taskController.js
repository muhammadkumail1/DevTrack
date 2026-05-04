const Task = require("../models/Task");
const Project = require("../models/Project");

// Helper: get the project IDs accessible to this user
async function getAccessibleProjectIds(user) {
  if (user.role === "Admin") return null; // null = no restriction
  let filter = {};
  if (user.role === "Manager") {
    filter.$or = [{ manager: user._id }, { members: user._id }];
  } else {
    filter.members = user._id;
  }
  const projects = await Project.find(filter).select("_id");
  return projects.map((p) => p._id);
}

exports.getTasks = async (req, res) => {
  try {
    const { project, sprint, status, assignedTo } = req.query;
    let filter = {};
    if (project) filter.project = project;
    if (sprint) filter.sprint = sprint;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Scope by accessible projects unless Admin
    if (req.user.role !== "Admin") {
      const ids = await getAccessibleProjectIds(req.user);
      // If a project filter was specified, it must be within their accessible set
      if (filter.project) {
        const allowed = ids.map((id) => id.toString());
        if (!allowed.includes(filter.project)) {
          return res.json([]);
        }
      } else {
        filter.project = { $in: ids };
      }
    }
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
    // Verify user has access to the target project
    if (req.user.role !== "Admin" && req.body.project) {
      const ids = await getAccessibleProjectIds(req.user);
      const allowed = ids.map((id) => id.toString());
      if (!allowed.includes(req.body.project)) {
        return res.status(403).json({ message: "You don't have access to that project." });
      }
    }
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
    // Verify access: developer can update only tasks in their projects
    const existing = await Task.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Task not found" });
    if (req.user.role !== "Admin") {
      const ids = await getAccessibleProjectIds(req.user);
      const allowed = ids.map((id) => id.toString());
      if (!allowed.includes(existing.project?.toString())) {
        return res.status(403).json({ message: "You don't have access to that project." });
      }
    }
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("project", "title")
      .populate("sprint", "name")
      .populate("assignedTo", "name email");
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
    // Only Manager (for their projects) or Admin can delete tasks
    if (req.user.role !== "Admin") {
      if (req.user.role !== "Manager") {
        return res.status(403).json({ message: "Only Managers and Admins can delete tasks." });
      }
      const existing = await Task.findById(req.params.id);
      if (!existing) return res.status(404).json({ message: "Task not found" });
      const ids = await getAccessibleProjectIds(req.user);
      const allowed = ids.map((id) => id.toString());
      if (!allowed.includes(existing.project?.toString())) {
        return res.status(403).json({ message: "You don't have access to that project." });
      }
    }
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
