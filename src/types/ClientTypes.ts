import * as DB from "./DatabaseTypes";

export interface DatabaseProvider {
  StoreWord(word: DB.Word): Promise<void>;
  StoreWords(words: DB.Word[]): Promise<void>;
}

export interface FullWordProvider {
  GetWords(words: string[]): Promise<DB.Word[]>;
};

export interface WordStore extends DatabaseProvider, FullWordProvider {};

export interface PartialWordProvider {
  GetWord(word: string): Promise<DB.WordDraft>;
}

export interface RandomWordProvider {
  GetRandomWords(num_words: number): Promise<string[]>
}

export interface WordFrequencyProvider {
  GetFrequencyScore(word: string): Promise<number>;
  GetMaxFrequencyScore(): number;
}