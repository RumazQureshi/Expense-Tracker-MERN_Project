const User = require('../models/User');
const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');

// Generate JWT Token

const GenerateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Register User
exports.registerUser = async (req, res) => {


  const { fullName, email, password, profileImageUrl } = req.body;

  // Validation: Check for missing fields
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Validation: Check for password length
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });

    }
    //create the user 
    const user = await User.create({
      fullName,
      email,
      password,
      profileImageUrl,
    });
    res.status(201).json({
      id: user._id,
      user,
      token: GenerateToken(user._id),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error registering user", error: err.message });

  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validation: check for missing fields
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });

    // Invalid email or password
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Success response
    res.status(200).json({
      id: user._id,
      user,
      token: GenerateToken(user._id),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error logging in user", error: err.message, });
  }
};

// Get User Info
exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "user not found" });

    }
    res.status(200).json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error logging in user", error: err.message, });
  }
};

// Update User Info
exports.updateUserInfo = async (req, res) => {
  try {
    const { fullName, profileImageUrl, currency } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old image if a new one is provided
    if (profileImageUrl && user.profileImageUrl && profileImageUrl !== user.profileImageUrl) {
      console.log(`[Profile Update] Changing image from ${user.profileImageUrl} to ${profileImageUrl}`);

      const oldUrlParts = user.profileImageUrl.split('/uploads/');
      // Check if the old image was actually a local upload
      if (oldUrlParts.length > 1) {
        const filename = oldUrlParts[1];
        const filePath = path.join(__dirname, '../uploads', filename);

        console.log(`[Profile Update] Attempting to delete old file: ${filePath}`);

        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("[Profile Update] Failed to delete old profile image:", err);
            } else {
              console.log("[Profile Update] Successfully deleted old profile image.");
            }
          });
        } else {
          console.log("[Profile Update] Old file not found on disk.");
        }
      }
    }

    if (fullName) user.fullName = fullName;
    if (profileImageUrl) user.profileImageUrl = profileImageUrl;
    if (currency) user.currency = currency;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};
