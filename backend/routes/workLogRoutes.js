const express = require("express");
const router = express.Router();
const {
  getWorkLogs,
  createWorkLog,
  updateWorkLog,
  deleteWorkLog,
} = require("../controllers/workLogController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/", getWorkLogs);
router.post("/", createWorkLog);
router.put("/:id", updateWorkLog);
router.delete("/:id", deleteWorkLog);

module.exports = router;
