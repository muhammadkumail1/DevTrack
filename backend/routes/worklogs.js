const express = require("express");
const router = express.Router();
const { getWorkLogs, createWorkLog, updateWorkLog, deleteWorkLog } = require("../controllers/workLogController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getWorkLogs);
router.post("/", protect, createWorkLog);
router.put("/:id", protect, updateWorkLog);
router.delete("/:id", protect, deleteWorkLog);

module.exports = router;
