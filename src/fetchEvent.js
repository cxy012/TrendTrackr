import { Octokit } from "@octokit/rest";
import {
  insertEvent,
  insertPushEvent,
  insertPullRequestEvent,
} from "./insertData.js";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function fetchAndInsertGitHubEvent(after) {
  try {
    let hasMoreEvents = true;
    const afterDate = new Date(after);
    let cnt = 0;

    while (hasMoreEvents) {
      const iterator = await octokit.paginate.iterator(octokit.rest.activity.listPublicEvents, {
        per_page: 100,
      })

      for await (const { data: events } of iterator) {
        for (const event of events) {
          cnt += 1;
          const eventCreatedAt = new Date(event.created_at);
          if (eventCreatedAt > afterDate) {
            const eventId = await insertEvent(event);
            if (!eventId) continue;

            if (event.type === "PushEvent") {
              await insertPushEvent(eventId, event.payload);
            } else if (event.type === "PullRequestEvent") {
              await insertPullRequestEvent(eventId, event.payload);
            }
          } else {
            hasMoreEvents = false;
            break;
          }
        }
      }
    }
    console.log(`Fetched ${cnt} GitHub events`);
  } catch (error) {
    console.error("Error fetching GitHub events:", error);
  }
}