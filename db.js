const mongoose = require("mongoose");

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Mongo connected");
}

const jobSchema = new mongoose.Schema({
  job_id: { type: Number, unique: true, index: true },
  title: String,
  url: String,
  created_at: { type: Date, default: Date.now }
});

const Job = mongoose.model("Job", jobSchema);

module.exports = { connectDB, Job };