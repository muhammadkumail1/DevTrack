const Requirement = require("../models/Requirement");

exports.getRequirements = async (req, res) => {
  try {
    const { project } = req.query;
    let filter = {};
    if (project) filter.project = project;
    const requirements = await Requirement.find(filter)
      .populate("project", "title")
      .sort({ createdAt: -1 });
    res.json(requirements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRequirement = async (req, res) => {
  try {
    const requirement = await Requirement.create(req.body);
    const populated = await Requirement.findById(requirement._id).populate("project", "title");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRequirement = async (req, res) => {
  try {
    const requirement = await Requirement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("project", "title");
    if (!requirement) return res.status(404).json({ message: "Requirement not found" });
    res.json(requirement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
