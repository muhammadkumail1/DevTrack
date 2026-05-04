const Bug = require("../models/Bug");
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

exports.getBugs = async (req, res) => {
  try {
    const { project, severity, status, assignedTo } = req.query;
    let filter = {};
    if (project) filter.project = project;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    if (req.user.role !== "Admin") {
      const ids = await getAccessibleProjectIds(req.user);
      if (filter.project) {
        const allowed = ids.map((id) => id.toString());
        if (!allowed.includes(filter.project)) return res.json([]);
      } else {
        filter.project = { $in: ids };
      }
    }
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
    if (req.user.role !== "Admin" && req.body.project) {
      const ids = await getAccessibleProjectIds(req.user);
      if (!ids.map((id) => id.toString()).includes(req.body.project)) {
        return res.status(403).json({ message: "You don't have access to that project." });
      }
    }
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
    if (req.user.role !== "Admin") {
      if (req.user.role !== "Manager") {
        return res.status(403).json({ message: "Only Managers and Admins can delete bugs." });
      }
      const existing = await Bug.findById(req.params.id);
      if (!existing) return res.status(404).json({ message: "Bug not found" });
      const ids = await getAccessibleProjectIds(req.user);
      if (!ids.map((id) => id.toString()).includes(existing.project?.toString())) {
        return res.status(403).json({ message: "You don't have access to that project." });
      }
    }
    const bug = await Bug.findByIdAndDelete(req.params.id);
    if (!bug) return res.status(404).json({ message: "Bug not found" });
    res.json({ message: "Bug deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
