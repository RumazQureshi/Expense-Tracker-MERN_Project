const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImageUrl: { type: String, default: null },
    currency: { type: String, default: 'USD' },
    securityQuestion: { type: String },
    securityAnswer: { type: String }, // Hashed
    failedLoginAttempts: { type: Number, default: 0 },
    completedTours: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Hash password and security answer before saving
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.isModified("securityAnswer")) {
    this.securityAnswer = await bcrypt.hash(this.securityAnswer, 10);
  }
  next();
});

// Compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Compare security answer
UserSchema.methods.matchSecurityAnswer = async function (candidateAnswer) {
  return await bcrypt.compare(candidateAnswer, this.securityAnswer);
};

module.exports = mongoose.model("User", UserSchema);