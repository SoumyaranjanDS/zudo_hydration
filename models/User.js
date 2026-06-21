const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, unique: true },
    biometrics: {
      gender: String,
      weightKg: Number,
      heightCm: Number,
      activityLevel: String, // sedentary, light, moderate, intense
      climate: String, // temperate, hot, high-altitude
    },
    dailyTargetMl: { type: Number },
    gamification: {
      xp: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      currentStreak: { type: Number, default: 0 },
      bestStreak: { type: Number, default: 0 },
      lastLogDate: { type: Date },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
