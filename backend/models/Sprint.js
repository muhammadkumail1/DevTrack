const mongoose = require("mongoose");

const sprintSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    name: String,
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ["Planned", "Active", "Completed"],
      default: "Planned",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sprint", sprintSchema);