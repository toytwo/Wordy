import * as LBase from "../types/LinguabaseTypes";

const DATASET = "linguabase/linguabase";
const CONFIG = "vocabulary_full";
const SPLIT = "train";
const BASE_URL = "https://datasets-server.huggingface.co/filter";

export async function GetWordFamiliarity(word: string): Promise<LBase.LinguabaseAPIResponse> {
  try {
    const escaped = word.replace(/'/g, "''");

    const url = new URL(BASE_URL);
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

    return { result: familiarityRank };
  } catch (error) {
    return { result: null, error: error };
  }
}