const Milestone = require("../models/Milestone");
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

exports.getMilestones = async (req, res) => {
  try {
    const { project } = req.query;
    let filter = {};
    if (project) filter.project = project;
    if (req.user.role !== "Admin") {
      const ids = await getAccessibleProjectIds(req.user);
      if (filter.project) {
        const allowed = ids.map((id) => id.toString());
        if (!allowed.includes(filter.project)) return res.json([]);
      } else {
        filter.project = { $in: ids };
      }
    }
    const milestones = await Milestone.find(filter)
      .populate("project", "title")
      .sort({ dueDate: 1 });
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.create(req.body);
    const populated = await Milestone.findById(milestone._id).populate("project", "title");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("project", "title");
    if (!milestone) return res.status(404).json({ message: "Milestone not found" });
    if (req.body.status === "Completed") {
      milestone.completedAt = new Date();
      await milestone.save();
    }
    res.json(milestone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      { status: "Approved" },
      { new: true }
    ).populate("project", "title");
    if (!milestone) return res.status(404).json({ message: "Milestone not found" });
    res.json(milestone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
