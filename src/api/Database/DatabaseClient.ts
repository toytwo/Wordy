import * as DB from "../../types/DatabaseTypes";
import { getDatabase } from "../../storage/Database";
import { DatabaseProvider, FullWordProvider } from "../../types/ClientTypes";

export class DatabaseClient implements DatabaseProvider, FullWordProvider {
  public async StoreWord(word: DB.Word): Promise<void> {
    return this.StoreWords([word]);
  }

  public async StoreWords(words: DB.Word[]): Promise<void> {
    const db = await getDatabase();

    await db.withTransactionAsync(async () => {
      for (const word of words) {
        for (const partial_word of word.partials) {
          const insertedWord = await db.runAsync(
            `INSERT INTO Words
              (word_text, word_type, status, offensive, pronunciation, syllable_split, difficulty, user_understanding)
              VALUES (?, ?, 'complete', ?, ?, ?, ?, ?)`,
            word.word_text,
            partial_word.word_type,
            partial_word.offensive ? 1 : 0,
            partial_word.pronunciation,
            partial_word.syllable_split,
            word.difficulty,
            word.user_understanding
          );

          const wordId = insertedWord.lastInsertRowId;

          for (const definition of partial_word.definitions) {
            const insertedDefinition = await db.runAsync(
              `INSERT INTO Definitions
                (word_id, group_number, subgroup_letter, subsubgroup_number,
                  definition_text)
                VALUES (?, ?, ?, ?, ?)`,
              wordId,
              definition.group_number,
              definition.subgroup_letter,
              definition.subsubgroup_number,
              definition.definition_text
            );

            const definitionId = insertedDefinition.lastInsertRowId;

            for (const example of definition.examples) {
              await db.runAsync(
                `INSERT INTO Examples (definition_id, example_text)
                  VALUES (?, ?)`,
                definitionId,
                example
              );
            }
          }

          for (const stem of partial_word.stems) {
            await db.runAsync(
              `INSERT INTO Stem_Words (word_id, stem_text)
                VALUES (?, ?)`,
              wordId,
              stem
            );
          }
        }
      }
    });
  }

  public async GetWords(words: string[]): Promise<DB.Word[]> {
    if (words.length === 0) {
      return [];
    }

    const db = await getDatabase();

    const placeholders = words.map(() => "?").join(", ");

    const wordRows = await db.getAllAsync<DB.WordRow>(
      `SELECT *
      FROM Words
      WHERE word_text IN (${placeholders})
      ORDER BY word_id`,
      ...words
    );

    if (wordRows.length === 0) {
      return [];
    }

    const wordIds = wordRows.map((row) => row.word_id);
    const wordPlaceholders = wordIds.map(() => "?").join(", ");

    const definitionRows = await db.getAllAsync<DB.DefinitionRow>(
      `SELECT *
      FROM Definitions
      WHERE word_id IN (${wordPlaceholders})
      ORDER BY definition_id`,
      ...wordIds
    );

    const stemRows = await db.getAllAsync<DB.StemRow>(
      `SELECT *
      FROM Stem_Words
      WHERE word_id IN (${wordPlaceholders})
      ORDER BY stem_id`,
      ...wordIds
    );

    const definitionIds = definitionRows.map((definition) => definition.definition_id);
    const exampleRows: DB.ExampleRow[] =
      definitionIds.length === 0
        ? []
        : await db.getAllAsync<DB.ExampleRow>(
          `SELECT *
            FROM Examples
            WHERE definition_id IN (${definitionIds.map(() => "?").join(", ")})
            ORDER BY example_id`,
          ...definitionIds
        );

    const examplesByDefinition = new Map<number, string[]>();

    for (const example of exampleRows) {
      const examples = examplesByDefinition.get(example.definition_id) ?? [];
      examples.push(example.example_text);
      examplesByDefinition.set(example.definition_id, examples);
    }

    const definitionsByWordId = new Map<number, DB.Definition[]>();

    for (const definition of definitionRows) {
      const definitions = definitionsByWordId.get(definition.word_id) ?? [];

      definitions.push({
        group_number: definition.group_number,
        subgroup_letter: definition.subgroup_letter,
        subsubgroup_number: definition.subsubgroup_number,
        definition_text: definition.definition_text,
        examples: examplesByDefinition.get(definition.definition_id) ?? []
      });

      definitionsByWordId.set(definition.word_id, definitions);
    }

    const stemsByWordId = new Map<number, string[]>();

    for (const stem of stemRows) {
      const stems = stemsByWordId.get(stem.word_id) ?? [];
      stems.push(stem.stem_text);
      stemsByWordId.set(stem.word_id, stems);
    }

    const wordsByText = new Map<string, DB.Word>();

    for (const row of wordRows) {
      let entry = wordsByText.get(row.word_text);

      if (!entry) {
        entry = {
          word_text: row.word_text,
          difficulty: row.difficulty,
          user_understanding: row.user_understanding,
          partials: []
        };
        wordsByText.set(row.word_text, entry);
      }

      entry.partials.push({
        word_type: row.word_type,
        offensive: Boolean(row.offensive),
        pronunciation: row.pronunciation,
        syllable_split: row.syllable_split,
        definitions: definitionsByWordId.get(row.word_id) ?? [],
        stems: stemsByWordId.get(row.word_id) ?? []
      });
    }

    return words
      .map((word) => wordsByText.get(word))
      .filter((entry): entry is DB.Word => entry !== undefined);
  }
}