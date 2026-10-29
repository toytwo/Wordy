import * as DB from "../types/DatabaseTypes";
import { PrintDB } from "../storage/Database";
import { PartialWordProvider, WordFrequencyProvider, RandomWordProvider, WordStore } from "../types/ClientTypes";
import { RequestFailedError, WordNotFoundError } from "../types/Errors";

export class WordService {
  public constructor(
    private wordProvider: PartialWordProvider,
    private frequencyProviders: WordFrequencyProvider[],
    private randomProvider: RandomWordProvider,
    private db: WordStore,
  ) { }

  public async GetRandomWord(): Promise<DB.Word | null> {
    let word = null;
    let attempts = 0;

    while (word == null && attempts < 5) {
      const randomWord = await this.SingleRandomWord();
      word = this.GetWord(randomWord);

      attempts++;
    }

    return word;
  }

  public async GetWord(word: string): Promise<DB.Word | null> {
    try {
      const stored_words = await this.db.GetWords([word]);

      // Cache Miss
      if (stored_words.length === 0) {
        let db_word = await this.BuildDBWord(word);

        if (db_word) {
          this.db.StoreWord(db_word);
          // PrintDB(); // TODO: Remove debug
        }

        return db_word
      }

      // Cache Hit
      return stored_words[0];
    }
    catch (error) {
      console.log("Word Retrieval Error: " + error);

      return null;
    }
  }

  private async BuildDBWord(word: string, canRetry: boolean = true): Promise<DB.Word | null> {
    try {
      const draft: DB.WordDraft = await this.wordProvider.GetWord(word);
      const difficulty: number = await this.GetDBWordDifficulty(draft);
      const full: DB.Word = {
        ...draft,
        difficulty: difficulty,
        user_understanding: 0
      };
      return full;
    }
    catch (error) {
      if (error instanceof RequestFailedError) {
        // TODO: Add wait?
        if (canRetry) {
          return await this.BuildDBWord(word, false);
        }
      }
      else if (error instanceof WordNotFoundError) {
        if (error.suggestions?.length && canRetry) {
          return await this.BuildDBWord(error.suggestions[0], false);
        }
      }

      console.log("Error during word request: " + error + "\nCHECK TODOs IN WORD SERVICE"); // TODO: Remove check todos

      return null;
    }
  }

  private async GetDBWordDifficulty(word: DB.WordDraft): Promise<number> {
    const MAX_DIFFICULTY = 100;

    let sum = 0;

    for (const provider of this.frequencyProviders) {
      let score = await provider.GetFrequencyScore(word.word_text);
      let max_score = provider.GetMaxFrequencyScore();

      sum += score / max_score * provider.weight;
    }
    const word_difficulty_score = MAX_DIFFICULTY * sum;

    return word_difficulty_score;
  }

  private async SingleRandomWord(): Promise<string> {
    const words = await this.randomProvider.GetRandomWords(1000);

    let wordList = words.filter((word) => /^[A-Za-z]+$/.test(word)); // Removes multi-words

    return wordList[Math.floor(Math.random() * wordList.length)];
  }
}