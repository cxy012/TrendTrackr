import axios from "axios";
import { load } from "cheerio";

const fetchGitHubTrending = async (language = "", since = "weekly") => {
  try {
    const url = `https://github.com/trending/${language}?since=${since}`;
    const response = await axios.get(url);
    const html = response.data;

    const $ = load(html);
    const trendingRepos = [];

    $("article.Box-row").each((i, el) => {
      const repoName = $(el).find("h2 a").text().trim().replace(/\s+/g, "");
      const stars = parseInt(
        $(el).find("a.Link--muted").eq(0).text().trim().replace(/,/g, ""),
        10
      );
      const forks = parseInt(
        $(el).find("a.Link--muted").eq(1).text().trim().replace(/,/g, ""),
        10
      );
      const repoLanguage =
        $(el).find('span[itemprop="programmingLanguage"]').text().trim() ||
        "Unknown";

      trendingRepos.push({
        repo_name: repoName,
        stars,
        forks,
        language: repoLanguage,
        created_at: new Date(),
      });
    });

    return trendingRepos;
  } catch (error) {
    console.error("Error fetching GitHub trending data:", error);
    throw error;
  }
};

export { fetchGitHubTrending };
