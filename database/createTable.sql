CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    actor_login VARCHAR(100) NOT NULL,
    actor_id BIGINT NOT NULL,
    repo_name VARCHAR(100) NOT NULL,
    repo_id BIGINT NOT NULL,
    payload JSONB
);

CREATE TABLE push_events (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    push_id BIGINT NOT NULL,
    commit_count INT NOT NULL,
    distinct_commit_count INT NOT NULL,
    ref VARCHAR(100) NOT NULL,
    head_commit_sha VARCHAR(40) NOT NULL,
    before_commit_sha VARCHAR(40) NOT NULL
);

CREATE TABLE commits (
    id BIGSERIAL PRIMARY KEY,
    push_event_id BIGINT REFERENCES push_events(id) ON DELETE CASCADE,
    sha VARCHAR(40) NOT NULL,
    author_email VARCHAR(100) NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_distinct BOOLEAN NOT NULL,
    url VARCHAR(255) NOT NULL
);

CREATE TABLE pull_request_events (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    pull_request_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL
);

CREATE TABLE trending (
    id BIGSERIAL PRIMARY KEY,
    repo_name VARCHAR(100) NOT NULL,
    stars INT NOT NULL,
    forks INT NOT NULL,
    language VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);
