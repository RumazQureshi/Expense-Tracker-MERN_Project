const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
    registerUser,
    loginUser,
    getUserInfo,
    updateUserInfo,
    resetPasswordWithSecurityQuestion,
    updateTourStatus,
} = require("../controllers/authController");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/getUser", protect, getUserInfo);
router.put("/update-user", protect, upload.single("image"), updateUserInfo);
router.post("/reset-password-security", resetPasswordWithSecurityQuestion);
router.put("/update-tour-status", protect, updateTourStatus);

router.post("/upload-image", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = req.file.path;
    res.status(200).json({ imageUrl });
});

module.exports = router;