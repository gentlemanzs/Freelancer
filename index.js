require("dotenv").config();
const cron = require("node-cron");

const { connectDB, Job } = require("./db");
const sendTelegram = require("./telegram");
const fetchJobs = require("./freelancer");

async function processJobs() {
  try {
    console.log("Checking jobs...");

    const jobs = await fetchJobs();

    for (const job of jobs.slice(0, 10)) {
      const exists = await Job.findOne({ job_id: job.id });

      if (!exists) {
        const url = `https://www.freelancer.com/projects/${job.seo_url}`;

        const msg = `
<b>🆕 Job mới</b>
<b>${job.title}</b>

💰 Budget: ${job.budget?.minimum || "?"} - ${job.budget?.maximum || "?"}

🔗 ${url}
        `;

        await sendTelegram(msg);

        await Job.create({
          job_id: job.id,
          title: job.title,
          url
        });

        console.log("Đã gửi:", job.title);
      }
    }
  } catch (err) {
    console.error("Lỗi job:", err.message);
  }
}

async function start() {
  await connectDB();

  // chạy ngay
  await processJobs();

  // chạy mỗi 10 phút
  cron.schedule("*/10 * * * *", processJobs);

  console.log("Bot started...");
}

start();