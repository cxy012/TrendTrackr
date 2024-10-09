import pool from "./db.js";

export async function insertEvent(event) {
  const { type: event_type, created_at, actor, repo, payload } = event;

  if (!event_type || !actor.login || !repo.name) {
    console.error("Missing required event data:", event);
    return null;
  }

  const query = `
        INSERT INTO events (event_type, created_at, actor_login, actor_id, repo_name, repo_id, payload)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;
    `;
  const values = [
    event_type,
    created_at,
    actor.login,
    actor.id,
    repo.name,
    repo.id,
    payload,
  ];

  try {
    const res = await pool.query(query, values);
    return res.rows[0].id;
  } catch (err) {
    console.error("Error inserting event:", err);
  }
}

export async function insertPushEvent(eventId, pushData) {
  const {
    push_id,
    size: commit_count,
    distinct_size: distinct_commit_count,
    ref,
    head,
    before,
    commits,
  } = pushData;

  if (!push_id || !commit_count || !distinct_commit_count || !ref) {
    console.error("Missing required push event data:", pushData);
    return;
  }

  const pushQuery = `
        INSERT INTO push_events (event_id, push_id, commit_count, distinct_commit_count, ref, head_commit_sha, before_commit_sha)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;
    `;
  const pushValues = [
    eventId,
    push_id,
    commit_count,
    distinct_commit_count,
    ref,
    head,
    before,
  ];

  try {
    const res = await pool.query(pushQuery, pushValues);
    const pushEventId = res.rows[0].id;

    for (const commit of commits) {
      await insertCommit(pushEventId, commit);
    }
  } catch (err) {
    console.error("Error inserting push event:", err);
  }
}

export async function insertCommit(pushEventId, commit) {
  const { sha, author, message, distinct, url } = commit;

  if (!sha || !author || !message) {
    console.error("Missing required commit data:", commit);
    return;
  }

  const query = `
        INSERT INTO commits (push_event_id, sha, author_email, author_name, message, is_distinct, url)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
    `;
  const values = [
    pushEventId,
    sha,
    author.email,
    author.name,
    message,
    distinct,
    url,
  ];

  try {
    await pool.query(query, values);
  } catch (err) {
    console.error("Error inserting commit:", err);
  }
}

export async function insertPullRequestEvent(eventId, pullRequestData) {
  const { action, pull_request } = pullRequestData;

  if (!action || !pull_request || !pull_request.id || !pull_request.title) {
    console.error("Missing required pull request data:", pullRequestData);
    return;
  }

  const query = `
        INSERT INTO pull_request_events (event_id, action, pull_request_id, title)
        VALUES ($1, $2, $3, $4);
    `;
  const values = [eventId, action, pull_request.id, pull_request.title];

  try {
    await pool.query(query, values);
  } catch (err) {
    console.error("Error inserting pull request event:", err);
  }
}

export async function insertTrendingData(trendingData) {
  const { repo_name, stars, forks, language, created_at } = trendingData;

  if (!repo_name || stars === null || forks === null || !language) {
    console.error("Missing required trending data:", trendingData);
    return;
  }

  const query = `
        INSERT INTO trending (repo_name, stars, forks, language, created_at)
        VALUES ($1, $2, $3, $4, $5);
    `;
  const values = [repo_name, stars, forks, language, created_at];

  try {
    await pool.query(query, values);
  } catch (err) {
    console.error("Error inserting trending data:", err);
  }
}
