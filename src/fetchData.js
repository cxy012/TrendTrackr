import axios from "axios";
import {
  insertEvent,
  insertPushEvent,
  insertPullRequestEvent,
} from "./insertData.js";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function fetchGitHubEvents() {
  try {
    const response = await axios.get("https://api.github.com/events", {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });

    for (const event of response.data) {
      const eventId = await insertEvent(event);
      if (!eventId) continue;

      if (event.type === "PushEvent") {
        await insertPushEvent(eventId, event.payload);
      } else if (event.type === "PullRequestEvent") {
        await insertPullRequestEvent(eventId, event.payload);
      }
    }
  } catch (error) {
    console.error("Error fetching GitHub events:", error);
  }
}
