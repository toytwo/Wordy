const schema = `
CREATE TABLE IF NOT EXISTS User_Settings (
  user_id INTEGER PRIMARY KEY CHECK (user_id = 1),
  difficulty_center INTEGER NOT NULL DEFAULT 35
);

CREATE TABLE IF NOT EXISTS Words (
  word_id INTEGER PRIMARY KEY,
  word_text TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('partial', 'complete')),
  difficulty INTEGER CHECK (
    difficulty IS NULL OR (difficulty >= 0 AND difficulty <= 100)
  ),
  offensive INTEGER CHECK (offensive IN (0, 1)),
  pronunciation TEXT,
  syllable_split TEXT
);

CREATE TABLE IF NOT EXISTS Definitions (
  word_id INTEGER NOT NULL,
  definition_id INTEGER PRIMARY KEY,
  word_type TEXT NOT NULL CHECK (word_type IN ('noun', 'verb', 'adjective', 'adverb')),
  group INTEGER NOT NULL CHECK (definition_group > 0),
  subgroup TEXT DEFAULT NULL CHECK (definition_subgroup IN ('a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z')),
  definition_text TEXT NOT NULL,
  difficulty INTEGER NOT NULL CHECK (difficulty >= 0 AND difficulty <= 100),
  user_understanding INTEGER NOT NULL DEFAULT 0 CHECK (user_understanding >= 0),

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
  stem_text TEXT UNIQUE NOT NULL,
  word_type TEXT NOT NULL CHECK (word_type IN ('noun', 'verb', 'adjective', 'adverb')),

  FOREIGN KEY (word_id) REFERENCES Words(word_id)
);
`;

export default schema;