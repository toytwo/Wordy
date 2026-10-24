export interface Word {
  word: string;
  score: number;
}

export type MuseAPIResponse = {
  result: Word[] | number | null,
  error?: string | unknown
}
