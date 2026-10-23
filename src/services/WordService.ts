import * as Merriam from "../types/MerriamTypes";
import * as DB from "../types/DatabaseTypes";
import { GetMuseWords } from "./MuseAPI";
import { GetMerriamWord } from "./MerriamAPI";
import { StoreDBWord, GetDBWord } from "./DatabaseAPI";
import { MerriamWordToDBWord } from "./TypeConverter";
import sampleWord from "../data/SampleWordData.json";
import { PrintDB } from "../storage/Database";

export async function GetRandomWord(): Promise<DB.Word> {
  let randomWord = await NewWord();
  return GetWord(randomWord);
}

export async function GetWord(word: string): Promise<DB.Word> {
  let db_response = await GetDBWord(word);

  if (db_response.error) {
    console.log(db_response.error);
  }

  // Cache Hit
  if (db_response.result) {
    return db_response.result[0];
  }

  // Cache Miss
  let response = await HandleMerriamReponse(word);

  if (Array.isArray(response)) {
    // Try one more time using options from merriam
    response = await HandleMerriamReponse(response[0]);
  }

  if (!response || Array.isArray(response)) {
    return MerriamWordToDBWord(sampleWord as Merriam.Word);
  }

  return response;
}

async function HandleMerriamReponse(word: string): Promise<DB.Word | string[] | null> {
  let merriam_response = await GetMerriamWord(word);

  if (merriam_response.word) {
    let word = MerriamWordToDBWord(merriam_response.word);

    let result = await StoreDBWord(word);

    if(result.error){
      console.log("DB Error:\n"+result.error);
    }
    else{
      await PrintDB();
    }

    return word;
  }

  console.log(merriam_response.error);

  if (merriam_response.options) {
    return merriam_response.options;
  }

  return null;
}


async function NewWord(): Promise<string> {
  let response = await GetMuseWords(1000);
  let words = null;

  if (!response.words) {
    words = [{ word: "test", score: 0 }];
  }
  else {
    words = response.words;
  }

  if (response.error) {
    console.log(response.error);
  }

  let wordList = words
    .filter((word) => /^[A-Za-z]+$/.test(word.word)); // Removes multi-words

  return wordList[Math.floor(Math.random() * wordList.length)].word;
}