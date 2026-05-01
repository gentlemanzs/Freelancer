const axios = require("axios");

const API_URL =
  "https://www.freelancer.com/api/projects/0.1/projects/active/";

const KEYWORDS = ["vietnamese", "viet", "việt"];

async function fetchJobs() {
  const { data } = await axios.get(API_URL, {
    params: { query: "vietnamese" },
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  const jobs = data?.result?.projects || [];

  return jobs.filter(job =>
    KEYWORDS.some(k =>
      job.title.toLowerCase().includes(k)
    )
  );
}

module.exports = fetchJobs;