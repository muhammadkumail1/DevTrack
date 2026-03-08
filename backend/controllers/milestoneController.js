const Milestone = require("../models/Milestone");

exports.getMilestones = async (req, res) => {
  try {
    const { project } = req.query;
    let filter = {};
    if (project) filter.project = project;
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
