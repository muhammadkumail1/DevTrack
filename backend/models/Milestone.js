const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema(
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
    dueDate: Date,
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Approved"],
      default: "Pending",
    },
    completedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Milestone", milestoneSchema);
