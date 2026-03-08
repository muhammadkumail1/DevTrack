const mongoose = require("mongoose");

const changeRequestSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["Submitted", "Under Review", "Approved", "Rejected", "Implemented"],
      default: "Submitted",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    impact: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChangeRequest", changeRequestSchema);
