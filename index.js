require("dotenv").config();
const cron = require("node-cron");

const { connectDB, Job } = require("./db");
const sendTelegram = require("./telegram");
const fetchJobs = require("./freelancer");

async function processJobs() {
  try {
    console.log("Checking jobs...");

    const jobs = await fetchJobs();
    if (jobs.length === 0) return;

    // 1. Tối ưu: Lấy danh sách job_id để query DB 1 lần duy nhất
    const jobIds = jobs.map(job => job.id);
    const existingJobs = await Job.find({ job_id: { $in: jobIds } }).select("job_id");
    
    // Sử dụng Set để check tồn tại nhanh hơn O(1) thay vì Array.includes
    const existingJobIds = new Set(existingJobs.map(j => j.job_id));

    // Lọc ra các job chưa có trong DB
    const newJobs = jobs.filter(job => !existingJobIds.has(job.id));

    for (const job of newJobs.slice(0, 10)) {
      const url = `https://www.freelancer.com/projects/${job.seo_url}`;
      
      // Xử lý tiền tệ an toàn
      const currency = job.currency?.code || "USD";
      const minBudget = job.budget?.minimum || "?";
      const maxBudget = job.budget?.maximum || "?";

      const msg = `
<b>🆕 Job mới</b>
<b>${job.title}</b>

💰 Budget: ${minBudget} - ${maxBudget} ${currency}

🔗 ${url}
      `;

      // 2. Logic an toàn: Gửi Telegram TRƯỚC
      await sendTelegram(msg);

      // 3. Chỉ khi Telegram không quăng lỗi thì mới lưu vết vào DB
      await Job.create({
        job_id: job.id,
        title: job.title,
        url
      });

      console.log("Đã thông báo & lưu DB:", job.title);
    }
  } catch (err) {
    console.error("Lỗi quá trình processJobs:", err.message);
  }
}

async function start() {
  await connectDB();

  // Chạy ngay khi vừa khởi động
  await processJobs();

  // Đổi thành mỗi 5 phút
  cron.schedule("*/5 * * * *", processJobs);

  console.log("Bot started. Đang theo dõi mỗi 5 phút...");
}

start();