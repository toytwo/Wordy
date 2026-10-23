export interface Word {
  word: string;
  score: number;
}

export type MuseAPIResponse = {
  words: Word[] | null,
  error?: string | unknown
}