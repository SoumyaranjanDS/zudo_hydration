const mongoose = require("mongoose");

const DailyLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amountMl: { type: Number, required: true },
  verified: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DailyLog", DailyLogSchema);
