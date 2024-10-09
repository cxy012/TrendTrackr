import { fetchGitHubEvents } from "./fetchData.js";
import { fetchGitHubTrending } from "./fetchTrending.js";
import { insertTrendingData } from "./insertData.js";

async function main() {
  await fetchGitHubEvents();

  const trendingData = await fetchGitHubTrending("", "weekly");
  for (const data of trendingData) {
    await insertTrendingData(data);
  }
}

main().catch((err) => console.error("Error in main:", err));
