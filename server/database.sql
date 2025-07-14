CREATE DATABASE notes_test;

CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE notes(
    note_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT,
    tag VARCHAR(255)
);

CREATE TABLE flashcards(
    flashcard_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255),
    question VARCHAR(255),
    answer VARCHAR(255),
    tag VARCHAR(255)
);

CREATE TABLE shared_notes (
  note_id INT REFERENCES notes(note_id),
  shared_user_id INT REFERENCES users(user_id),
  permission VARCHAR(10) DEFAULT 'view',
  PRIMARY KEY (note_id, shared_user_id)
);

CREATE TABLE shared_flashcards (
  flashcard_id INT REFERENCES flashcards(flashcard_id),
  shared_user_id INT REFERENCES users(user_id),
  permission VARCHAR(10) DEFAULT 'view',
  PRIMARY KEY (flashcard_id, shared_user_id)
);