import * as Muse from "../types/MuseTypes"

const BASE_URL = "https://api.datamuse.com";
const WORDS_ENDPOINT = "/words";
const SUGGESTION_ENDPOINT = "/sug";
const WILDCARD_CHARACTER = "*";

export const MAX_WORD_FREQUENCY_SCORE = 500;

export async function GetMuseWords(num_words: number): Promise<Muse.MuseAPIResponse>{
  const url = new URL(BASE_URL+WORDS_ENDPOINT);
  url.searchParams.set("sp", WILDCARD_CHARACTER);
  url.searchParams.set("max", `${num_words}`);

  try {
    const response = await fetch(url.toString());

    const json = await response.json();

    return { "result": json, "error": null };

  } catch (error) {
    return { "result": null, "error": error };
  }
}

export async function GetMuseFrequencyScore(word: string): Promise<Muse.MuseAPIResponse>{
  const url = new URL(BASE_URL+WORDS_ENDPOINT);
  url.searchParams.set("sp", word);
  url.searchParams.set("max", "1");
  url.searchParams.set("md", "f");

  try {
    const response = await fetch(url.toString());

    const json = await response.json();

    const freq_score = json.tags["f"];

    return { "result": freq_score, "error": null };

  } catch (error) {
    return { "result": null, "error": error };
  }
}