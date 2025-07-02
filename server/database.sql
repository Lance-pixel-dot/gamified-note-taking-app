CREATE DATABASE notes_test;

CREATE TABLE notes(
    note_id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    content TEXT,
    tag VARCHAR(255)
);

CREATE TABLE flashcards(
    flashcard_id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    question VARCHAR(255),
    answer VARCHAR(255),
    tag VARCHAR(255)
);