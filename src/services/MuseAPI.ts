import * as Muse from "../types/MuseTypes"

export async function GetMuseWords(num_words: number): Promise<Muse.MuseAPIResponse>{
  try {
    const response = await fetch(
      "https://api.datamuse.com/words?sp=*&max=" + num_words
    );

    const json = await response.json();

    return { "words": json, "error": null };

  } catch (error) {
    return { "words": null, "error": error };
  }
}