const ChangeRequest = require("../models/ChangeRequest");

exports.getChangeRequests = async (req, res) => {
  try {
    const { project } = req.query;
    let filter = {};
    if (project) filter.project = project;
    const changeRequests = await ChangeRequest.find(filter)
      .populate("project", "title")
      .populate("requestedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(changeRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createChangeRequest = async (req, res) => {
  try {
    const changeRequest = await ChangeRequest.create({
      ...req.body,
      requestedBy: req.body.requestedBy || req.user._id,
    });
    const populated = await ChangeRequest.findById(changeRequest._id)
      .populate("project", "title")
      .populate("requestedBy", "name email");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateChangeRequest = async (req, res) => {
  try {
    const changeRequest = await ChangeRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("project", "title")
      .populate("requestedBy", "name email");
    if (!changeRequest) return res.status(404).json({ message: "Change request not found" });
    res.json(changeRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
