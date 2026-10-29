import { RandomWordProvider, WordFrequencyProvider } from "../../types/ClientTypes";
import { RequestFailedError, WordNotFoundError } from "../../types/Errors";
import { MuseWordToDBWord } from "./MuseMapper";
import * as Muse from "./MuseTypes";

const BASE_URL = "https://api.datamuse.com";
const WORDS_ENDPOINT = "/words";
// const SUGGESTION_ENDPOINT = "/sug";
const WILDCARD_CHARACTER = "*";

const MAX_WORD_FREQUENCY_SCORE = 500;

export class MuseClient implements RandomWordProvider, WordFrequencyProvider {
  weight: number;

  public constructor(weight: number) {
    this.weight = weight;
  }

  public GetMaxFrequencyScore(): number {
    return MAX_WORD_FREQUENCY_SCORE;
  }

  public async GetRandomWords(num_words: number): Promise<string[]> {
    const url = new URL(BASE_URL + WORDS_ENDPOINT);
    url.searchParams.set("sp", WILDCARD_CHARACTER);
    url.searchParams.set("max", `${num_words}`);

    const response = await fetch(url.toString());

    const result = await response.json();

    return result.map((word: Muse.Word) => MuseWordToDBWord(word));
  }

  public async GetFrequencyScore(word: string): Promise<number> {
    const url = new URL(BASE_URL + WORDS_ENDPOINT);
    url.searchParams.set("sp", word);
    url.searchParams.set("max", "1");
    url.searchParams.set("md", "f");

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new RequestFailedError("Muse", response.status);
    }

    const result = await response.json();

    if (result.length === 0) {
      throw new WordNotFoundError(word, null);
    }

    const result_word = result[0] as Muse.Word;

    const tag = result_word.tags?.find((t: string) => t.startsWith("f:"));
    if (!tag) {
      throw new Error("Muse found the word but couldn't find the frequency score.");
    }

    const freq_score = parseFloat(tag.slice(2));
    if (Number.isNaN(freq_score)) {
      throw new Error(`Muse returned an unparseable frequency tag: ${tag}`);
    }

    return freq_score;
  }
}