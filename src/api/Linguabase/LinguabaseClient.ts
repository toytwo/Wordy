import { WordFrequencyProvider } from "../../types/ClientTypes";

const DATASET = "linguabase/linguabase";
const CONFIG = "vocabulary_full";
const SPLIT = "train";
const BASE_URL = "https://datasets-server.huggingface.co";
const FILTER_ENDPOINT = "/filter";
const MAX_WORD_FREQUENCY_SCORE = 2000000;

export class LinguabaseClient implements WordFrequencyProvider {
  weight: number;

  public constructor(weight: number) {
    this.weight = weight;
  }

  public GetMaxFrequencyScore(): number {
    return MAX_WORD_FREQUENCY_SCORE;
  }

  public async GetFrequencyScore(word: string): Promise<number> {
    const escaped = word.replace(/'/g, "''");

    const url = new URL(BASE_URL + FILTER_ENDPOINT);
    url.searchParams.set("dataset", DATASET);
    url.searchParams.set("config", CONFIG);
    url.searchParams.set("split", SPLIT);
    url.searchParams.set("where", `"word"='${escaped}'`);
    url.searchParams.set("offset", "0");
    url.searchParams.set("length", "1");

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Dataset viewer returned ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();

    const familiarityRank = result.rows?.[0]?.row?.familiarity_rank ?? null;

    return familiarityRank
  }
}