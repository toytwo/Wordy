import { WORD_TYPES } from "../types/DatabaseTypes";

const WORD_TYPE_LIST = WORD_TYPES.map((type) => `'${type}'`).join(", ");

const schema = `
CREATE TABLE IF NOT EXISTS User_Settings (
  user_id INTEGER PRIMARY KEY CHECK (user_id = 1),
  difficulty_center INTEGER NOT NULL DEFAULT 35
);

CREATE TABLE IF NOT EXISTS Words (
  word_id INTEGER PRIMARY KEY,
  word_text TEXT NOT NULL,
  pronunciation TEXT,
  syllable_split TEXT,
  offensive INTEGER NOT NULL CHECK (
    offensive IN (0, 1)
  ),
  difficulty INTEGER CHECK (
    difficulty IS NULL OR (difficulty >= 0 AND difficulty <= 100)
  ),
  user_understanding INTEGER CHECK (
    user_understanding >= 0
  ),
  word_type TEXT NOT NULL CHECK (
    word_type IN (${WORD_TYPE_LIST})
  ),
  status TEXT NOT NULL CHECK (
    status IN ('draft', 'complete')
  )
);

CREATE INDEX IF NOT EXISTS idx_words
ON Words(word_text);

CREATE TABLE IF NOT EXISTS Definitions (
  word_id INTEGER NOT NULL,
  definition_id INTEGER PRIMARY KEY,
  definition_text TEXT NOT NULL,
  group_number INTEGER NOT NULL CHECK (group_number > 0),
  subgroup_letter TEXT DEFAULT NULL CHECK (subgroup_letter IN ('a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z')),
  subsubgroup_number INTEGER DEFAULT NULL CHECK (subsubgroup_number > 0),

  FOREIGN KEY (word_id) REFERENCES Words(word_id)
);

CREATE TABLE IF NOT EXISTS Examples (
  definition_id INTEGER NOT NULL,
  example_id INTEGER PRIMARY KEY,
  example_text TEXT NOT NULL,

  FOREIGN KEY (definition_id) REFERENCES Definitions(definition_id)
);

CREATE TABLE IF NOT EXISTS Stem_Words (
  word_id INTEGER NOT NULL,
  stem_id INTEGER PRIMARY KEY,
  stem_text TEXT NOT NULL,

  FOREIGN KEY (word_id) REFERENCES Words(word_id)
);
`;

export default schema;