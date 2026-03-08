require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const bugRoutes = require("./routes/bugRoutes");
const sprintRoutes = require("./routes/sprintRoutes");
const userRoutes = require("./routes/userRoutes");
const workLogRoutes = require("./routes/workLogRoutes");
const milestoneRoutes = require("./routes/milestoneRoutes");
const requirementRoutes = require("./routes/requirementRoutes");
const changeRequestRoutes = require("./routes/changeRequestRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/bugs", bugRoutes);
app.use("/api/sprints", sprintRoutes);
app.use("/api/users", userRoutes);
app.use("/api/worklogs", workLogRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/requirements", requirementRoutes);
app.use("/api/change-requests", changeRequestRoutes);
app.use("/api/reports", reportRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});