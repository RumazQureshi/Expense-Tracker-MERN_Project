const express = require("express");

const { protect } = require("../middleware/authMiddleware");

const { getDashboardData, getAllTransactions } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/", protect, getDashboardData);
router.get("/transactions", protect, getAllTransactions);

module.exports = router;
