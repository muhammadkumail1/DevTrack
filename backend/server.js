require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/roles", require("./routes/roles"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/bugs", require("./routes/bugs"));
app.use("/api/sprints", require("./routes/sprints"));
app.use("/api/milestones", require("./routes/milestones"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/worklogs", require("./routes/worklogs"));
app.use("/api/requirements", require("./routes/requirements"));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`DevTrack running on http://localhost:${PORT}`));
