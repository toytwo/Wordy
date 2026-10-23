export type Word = {
  word_id: number
  definitions: Definition[]
  word_text: string
  stems: Stem[]
  offensive: boolean
  pronunciation: string
  syllable_split: string
};

export type Definition = {
  word_id: number
  definition_id: number
  word_type: WordType
  group_number: number
  subgroup_letter: string
  definition_text: string
  difficulty: number
  user_understanding: number
  examples: Example[]
};

export type Example = {
  definition_id: number
  example_id: number
  example_text: string
};

export type WordType = "noun" | "adjective" | "verb" | "adverb";

export type Stem = {
  word_id: number
  stem_id: number
  stem_text: string
  word_type: WordType
};

export type DBAPIResponse = {
  success: boolean,
  result: Word[] | null,
  error?: string | unknown
}