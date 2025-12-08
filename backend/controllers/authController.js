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
        // Fallback if no security question set - though requirement says "save it in db so that..." implying flow depends on it.
        // Ideally user should set it up. If not, they might be stuck unless we allow generic reset or contact support.
        // For now, let's keep the message generic or just return invalid credentials if we want to hide existence (but here user knows email is right).
        // Let's assume we return locked message but with no question if they haven't set one?
        // Or just allow retry if no sec question? "User entered wrong pass 3 times then there should be an option arrive"
        // If no security question, maybe just block?
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
exports.updateUserInfo = async (req, res) => {
  try {
    const { fullName, profileImageUrl, currency } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old image if a new one is provided or if usage is explicitly removed
    if ((profileImageUrl || profileImageUrl === "") && user.profileImageUrl && profileImageUrl !== user.profileImageUrl) {
      console.log(`[Profile Update] Changing image from ${user.profileImageUrl} to ${profileImageUrl || "null"}`);

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
    if (profileImageUrl || profileImageUrl === "") user.profileImageUrl = profileImageUrl === "" ? null : profileImageUrl;
    if (currency) user.currency = currency;

    // Update Security Question
    const { securityQuestion, securityAnswer } = req.body;
    if (securityQuestion) user.securityQuestion = securityQuestion;
    if (securityAnswer) user.securityAnswer = securityAnswer; // Hashed by pre-save hook

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (err) {
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
