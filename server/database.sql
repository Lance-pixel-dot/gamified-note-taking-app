CREATE DATABASE notes_test;

CREATE TABLE notes(
    note_id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    content TEXT,
    tag VARCHAR(255)
);
