const axios = require("axios");

const API_URL = "https://www.freelancer.com/api/projects/0.1/projects/active/";
const KEYWORDS = ["vietnamese", "viet", "việt"];

async function fetchJobs() {
  const { data } = await axios.get(API_URL, {
    params: { 
      query: "vietnamese",
      compact: false // Đảm bảo API trả về nhiều data hơn như currency, description
    },
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  const jobs = data?.result?.projects || [];

  return jobs.filter(job => {
    const titleMatch = job.title?.toLowerCase().includes(k => KEYWORDS.includes(k));
    const descMatch = job.preview_description?.toLowerCase().includes(k => KEYWORDS.includes(k));
    
    return KEYWORDS.some(k => 
      (job.title && job.title.toLowerCase().includes(k)) || 
      (job.preview_description && job.preview_description.toLowerCase().includes(k))
    );
  });
}

module.exports = fetchJobs;