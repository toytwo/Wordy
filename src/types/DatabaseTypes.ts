export type WordRow = Omit<PartialWord, "stems" | "definitions" | "offensive"> & Omit<Word, "partials"> & {
  word_id: number;
  offensive: number;
};

export type PartialWord = {
  pronunciation: string;
  syllable_split: string;
  offensive: boolean;
  word_type: WordType;
  definitions: Definition[];
  stems: string[];
};

export type Word = {
  partials: PartialWord[];
  word_text: string;
  difficulty: number;
  user_understanding: number;
};

export type WordDraft = Omit<Word, "difficulty" | "user_understanding">

export type DefinitionRow = Omit<Definition, "examples"> & {
  word_id: number;
  definition_id: number;
};

export type Definition = {
  definition_text: string;
  group_number: number;
  subgroup_letter: string | null;
  subsubgroup_number: number | null;
  examples: string[];
};

export type ExampleRow = {
  definition_id: number;
  example_id: number;
  example_text: string;
};

export type StemRow = {
  stem_id: number;
  word_id: number;
  stem_text: string;
};

export const WORD_TYPES = ["noun", "adjective", "verb", "adverb", "pronoun", "conjunction", "interjection", "definite article", "transitive verb", "intransitive verb"] as const;
export type WordType = typeof WORD_TYPES[number];