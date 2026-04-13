CREATE TABLE app_state (
    id serial primary key,
    last_updated timestamptz not null default NOW()
);

INSERT INTO app_state (id) VALUES(1);