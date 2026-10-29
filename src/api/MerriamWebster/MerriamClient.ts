import { WordNotFoundError, RequestFailedError } from "../../types/Errors";
import { PartialWordProvider } from "../../types/ClientTypes";
import Config from "react-native-config";
import * as DB from "../../types/DatabaseTypes";
import { MerriamWordToDBWord } from "./MerriamMapper";
import * as merriam from "./MerriamTypes";

const API_KEY = Config.MERRIAM_WEBSTER_DICTIONARY_API_KEY;
const BASE_URL = "https://dictionaryapi.com/api/v3/references/collegiate/json";

export class MerriamClient implements PartialWordProvider {
  async GetWord(word: string): Promise<DB.WordDraft> {
    if (!API_KEY) {
      throw new Error("Merriam API Key Not Found");
    }

    const url = new URL(`${BASE_URL}/${encodeURIComponent(word)}`);
    url.searchParams.set("key", API_KEY);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new RequestFailedError("Merriam", response.status);
    }

    const result = await response.json();

    // Requested word not found, merriam returned similar words
    if (result.length === 0 || typeof result[0] === "string") {
      throw new WordNotFoundError(word, result);
    }

    return MerriamWordToDBWord(result as merriam.Word, word);
  }
}