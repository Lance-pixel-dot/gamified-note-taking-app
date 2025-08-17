CREATE DATABASE notes_test;

CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_count INTEGER DEFAULT 0,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    coins INTEGER DEFAULT 0
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

CREATE TABLE read_notes (
    read_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    note_id INTEGER,
    last_read_date TIMESTAMP,
    UNIQUE(user_id, note_id)
);

CREATE TABLE review_flashcards (
    review_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    flashcard_id INTEGER,
    last_read_date TIMESTAMP,
    easy_count INTEGER DEFAULT 0,
    UNIQUE(user_id, flashcard_id)
);

CREATE TABLE achievements (
  achievement_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER DEFAULT 0,
  type TEXT
);

CREATE TABLE user_achievements (
  user_id INTEGER REFERENCES users(user_id),
  achievement_id INTEGER REFERENCES achievements(achievement_id),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE themes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    css_class TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
);

CREATE TABLE user_themes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    theme_id INTEGER NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
    is_selected BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (user_id, theme_id)
);

CREATE TABLE created_notes (
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    total_notes INTEGER DEFAULT 0
);

CREATE TABLE created_flashcards (
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    total_notes INTEGER DEFAULT 0
);
