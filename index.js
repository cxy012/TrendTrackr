import 'dotenv/config'
import { fetchAndInsertGitHubEvent } from "./src/fetchEvent.js";
import { fetchGitHubTrending } from "./src/fetchTrending.js";
import { insertTrendingData } from "./src/insertData.js";
function getOneHourAgo() {
  const date = new Date();
  date.setHours(date.getHours() - 1);
  return date.toISOString();
}

async function main() {
  await fetchAndInsertGitHubEvent(getOneHourAgo());

  const trendingData = await fetchGitHubTrending("", "weekly");
  for (const data of trendingData) {
    await insertTrendingData(data);
  }
}

main().catch((err) => console.error("Error in main:", err));
