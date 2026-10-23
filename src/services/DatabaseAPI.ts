import * as DB from "../types/DatabaseTypes";
import { getDatabase } from "../storage/Database";

function ErrorResponse(error: unknown): DB.DBAPIResponse {
  return { success: false, result: null, error };
}

export async function StoreDBWord(word: DB.Word): Promise<DB.DBAPIResponse> {
  return StoreDBWords([word]);
}

export async function StoreDBWords(words: DB.Word[]): Promise<DB.DBAPIResponse> {
  try {
    const db = await getDatabase();

    await db.withTransactionAsync(async () => {
      for (const word of words) {
        const insertedWord = await db.runAsync(
          `INSERT INTO Words
            (word_text, status, offensive, pronunciation, syllable_split)
           VALUES (?, 'complete', ?, ?, ?)`,
          word.word_text,
          word.offensive ? 1 : 0,
          word.pronunciation,
          word.syllable_split
        );

        const wordId = insertedWord.lastInsertRowId;

        for (const definition of word.definitions) {
          const insertedDefinition = await db.runAsync(
            `INSERT INTO Definitions
              (word_id, word_type, group_number, subgroup_letter,
               definition_text, difficulty, user_understanding)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            wordId,
            definition.word_type,
            definition.group_number,
            definition.subgroup_letter,
            definition.definition_text,
            definition.difficulty,
            definition.user_understanding
          );

          const definitionId = insertedDefinition.lastInsertRowId;

          for (const example of definition.examples) {
            await db.runAsync(
              `INSERT INTO Examples (definition_id, example_text)
               VALUES (?, ?)`,
              definitionId,
              example.example_text
            );
          }
        }

        for (const stem of word.stems) {
          await db.runAsync(
            `INSERT INTO Stem_Words (word_id, stem_text, word_type)
             VALUES (?, ?, ?)`,
            wordId,
            stem.stem_text,
            stem.word_type
          );
        }
      }
    });

    return { success: true, result: null };
    
  } catch (error) {
    return ErrorResponse(error);
  }
}

export async function GetDBWord(word: string): Promise<DB.DBAPIResponse> {
  return GetDBWords([word]);
}

export async function GetDBWords(words: string[]): Promise<DB.DBAPIResponse> {
  if (words.length === 0) {
    return { success: true, result: [] };
  }

  const db = await getDatabase();

  try {
    const placeholders = words.map(() => "?").join(", ");

    const wordRows = await db.getAllAsync<DB.Word>(
      `SELECT *
       FROM Words
       WHERE word_text IN (${placeholders})`,
      ...words
    );

    if (wordRows.length === 0) {
      return ErrorResponse(`No words from ${words} found.`);
    }

    const wordIds = wordRows.map((word) => word.word_id);
    const wordPlaceholders = wordIds.map(() => "?").join(", ");

    const definitionRows = await db.getAllAsync<DB.Definition>(
      `SELECT *
       FROM Definitions
       WHERE word_id IN (${wordPlaceholders})`,
      ...wordIds
    );

    const stemRows = await db.getAllAsync<DB.Stem>(
      `SELECT *
       FROM Stem_Words
       WHERE word_id IN (${wordPlaceholders})`,
      ...wordIds
    );

    const definitionIds = definitionRows.map((definition) => definition.definition_id);
    const exampleRows: DB.Example[] = await db.getAllAsync<DB.Example>(
      `SELECT *
        FROM Examples
        WHERE definition_id IN (${definitionIds.map(() => "?").join(", ")})`,
      ...definitionIds
    );

    const examplesByDefinition = new Map<number, DB.Example[]>();

    for (const example of exampleRows) {
      const examples = examplesByDefinition.get(example.definition_id) ?? [];

      examples.push({
        definition_id: example.definition_id,
        example_id: example.example_id,
        example_text: example.example_text
      });

      examplesByDefinition.set(example.definition_id, examples);
    }

    const definitionsByWord = new Map<number, DB.Definition[]>();

    for (const definition of definitionRows) {
      const definitions = definitionsByWord.get(definition.word_id) ?? [];

      definitions.push({
        word_id: definition.word_id,
        definition_id: definition.definition_id,
        group_number: definition.group_number,
        subgroup_letter: definition.subgroup_letter,
        definition_text: definition.definition_text,
        examples: examplesByDefinition.get(definition.definition_id) ?? [],
        difficulty: definition.difficulty,
        user_understanding: definition.user_understanding,
        word_type: definition.word_type
      });

      definitionsByWord.set(definition.word_id, definitions);
    }

    const stemsByWord = new Map<number, DB.Stem[]>();

    for (const stem of stemRows) {
      const stems = stemsByWord.get(stem.word_id) ?? [];
      stems.push({
        word_id: stem.word_id,
        stem_id: 0,
        stem_text: stem.stem_text,
        word_type: stem.word_type
      });
      stemsByWord.set(stem.word_id, stems);
    }

    const wordsById = new Map<number, DB.Word>();

    for (const word of wordRows) {
      wordsById.set(word.word_id, {
        word_id: word.word_id,
        word_text: word.word_text,
        offensive: Boolean(word.offensive),
        pronunciation: word.pronunciation,
        syllable_split: word.syllable_split,
        definitions: definitionsByWord.get(word.word_id) ?? [],
        stems: stemsByWord.get(word.word_id) ?? []
      });
    }

    const result = words
      .map((word) => wordRows.find((row) => row.word_text === word))
      .filter((row): row is DB.Word => row !== undefined)
      .map((row) => wordsById.get(row.word_id)!);

    return { success: true, result };
  } catch (error) {
    return ErrorResponse(error);
  }
}