export type WordRow = {
  word_id: number
  definitions: DefinitionRow[]
  word_text: string
  stems: StemRow[]
  offensive: boolean
  pronunciation: string
  syllable_split: string
  word_type: WordType
};

export type PartialWord = {
  definitions: Definition[]
  word_text: string
  stems: string[]
  offensive: boolean
  pronunciation: string
  syllable_split: string
  word_type: WordType
};

export type Word = PartialWord[];

export type PartialWordDraft = {
  definitions: DefinitionDraft[]
  word_text: string
  stems: string[]
  offensive: boolean
  pronunciation: string
  syllable_split: string
  word_type: WordType
};

export type WordDraft = PartialWordDraft[];

export type DefinitionRow = {
  word_id: number
  definition_id: number
  group_number: number
  subgroup_letter: string | null
  subsubgroup_number: number | null
  definition_text: string
  difficulty: number
  user_understanding: number
  examples: ExampleRow[]
};

export type Definition = {
  group_number: number
  subgroup_letter: string | null
  subsubgroup_number: number | null
  definition_text: string
  difficulty: number
  user_understanding: number
  examples: string[]
};

export type DefinitionDraft = {
  group_number: number
  subgroup_letter: string | null
  subsubgroup_number: number | null
  definition_text: string
  examples: string[]
};

export type ExampleRow = {
  definition_id: number
  example_id: number
  example_text: string
};

export type StemRow = {
  stem_id: number
  word_id: number
  stem_text: string
};

export const WORD_TYPES = ["noun", "adjective", "verb", "adverb", "pronoun", "conjunction", "interjection", "definite article"] as const;
export type WordType = typeof WORD_TYPES[number];