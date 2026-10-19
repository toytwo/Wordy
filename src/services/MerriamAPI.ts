import * as Merriam from "../types/MerriamTypes";
import Config from "react-native-config";

const API_KEY = Config.MERRIAM_WEBSTER_DICTIONARY_API_KEY;

export async function GetMerriamWord(word: string): Promise<Merriam.MerriamAPIResponse> {
    try {
      const response = await fetch(
          `https://dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${API_KEY}`
      );

      const json = await response.json();

      if (Array.isArray(json) && json[0]?.meta) {
          return {"word": json[0], "error": null};
      }

      if (Array.isArray(json) && typeof json[0] === "string") { 
        return {"word": null, "error": `Requested word '${word}' not found. Check options for similar words.`, "options": json}
      }

  } catch (error) {
      return {"word": null, "error": error};
  }

  return {"word": null, "error": `Requested word '${word}' not found.`}
}