const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ["Functional", "Non-Functional", "Technical"],
      default: "Functional",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Draft", "Approved", "Implemented", "Rejected"],
      default: "Draft",
    },
    documentUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Requirement", requirementSchema);
