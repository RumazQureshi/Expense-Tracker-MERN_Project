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

    // User not found
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check failed attempts
    if (user.failedLoginAttempts >= 3) {
      // Check if security question is set
      if (user.securityQuestion && user.securityAnswer) {
        return res.status(403).json({
          message: "Account locked. Please answer your security question to reset password.",
          errorType: "ACCOUNT_LOCKED",
          securityQuestion: user.securityQuestion
        });
      } else {
        return res.status(403).json({ message: "Account locked. Please contact support.", errorType: "ACCOUNT_LOCKED_NO_QA" });
      }
    }

    // Invalid password
    if (!(await user.comparePassword(password))) {
      user.failedLoginAttempts += 1;
      await user.save();

      const attemptsLeft = 4 - user.failedLoginAttempts;
      if (attemptsLeft === 0) {
        if (user.securityQuestion) {
          return res.status(403).json({
            message: "Account locked. Please answer your security question to reset password.",
            errorType: "ACCOUNT_LOCKED",
            securityQuestion: user.securityQuestion
          });
        }
        return res.status(403).json({ message: "Account locked.", errorType: "ACCOUNT_LOCKED_NO_QA" });
      }

      return res.status(400).json({ message: `Invalid credentials. ${attemptsLeft} attempts remaining.` });
    }

    // Success response - Reset failed attempts
    user.failedLoginAttempts = 0;
    await user.save();

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
// Update User Info
exports.updateUserInfo = async (req, res) => {
  try {
    const { fullName, currency } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle Profile Image Logic
    let newProfileImageUrl = user.profileImageUrl;

    // 1. If a file was uploaded?
    if (req.file) {
      newProfileImageUrl = req.file.path;
    }
    // 2. If no file, check if image was removed (empty string passed in body)
    else if (req.body.profileImageUrl === "") {
      newProfileImageUrl = null;
    }
    // 3. Otherwise, keep existing (req.body.profileImageUrl might be the old URL or undefined)

    // Cleanup: If the image URL is changing, and the old one was a local upload, delete it.
    if (newProfileImageUrl !== user.profileImageUrl && user.profileImageUrl) {
      const oldUrlParts = user.profileImageUrl.split('/uploads/');
      if (oldUrlParts.length > 1) {
        const filename = oldUrlParts[1];
        const filePath = path.join(__dirname, '../uploads', filename);

        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) console.error("Failed to delete old image:", err);
          });
        }
      }
    }

    user.profileImageUrl = newProfileImageUrl;
    if (fullName) user.fullName = fullName;
    if (currency) user.currency = currency;

    // Update Security Question
    const { securityQuestion, securityAnswer } = req.body;
    if (securityQuestion) user.securityQuestion = securityQuestion;
    if (securityAnswer) user.securityAnswer = securityAnswer;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};

// Reset Password with Security Question
exports.resetPasswordWithSecurityQuestion = async (req, res) => {
  const { email, securityAnswer, newPassword } = req.body;

  if (!email || !securityAnswer || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.securityAnswer) {
      return res.status(400).json({ message: "Security question not set up for this account." });
    }

    const isMatch = await user.matchSecurityAnswer(securityAnswer);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect security answer" });
    }

    user.password = newPassword; // Will be hashed by pre-save
    user.failedLoginAttempts = 0; // Unlock account
    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now login." });
  } catch (err) {
    res.status(500).json({ message: "Error resetting password", error: err.message });
  }
};

// Update Tour Status
exports.updateTourStatus = async (req, res) => {
  try {
    const { route } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (route && !user.completedTours.includes(route)) {
      user.completedTours.push(route);
      await user.save();
    }

    res.status(200).json({ message: "Tour status updated", completedTours: user.completedTours });
  } catch (error) {
    res.status(500).json({ message: "Error updating tour status", error: error.message });
  }
};
