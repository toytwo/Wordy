import * as DB from "../types/DatabaseTypes";
import { GetWordFamiliarity } from "./LinguabaseAPI";

export async function SetDBWordDifficulty(word: DB.Word): Promise<DB.Word>{
  // LBASE
  const placeholder_max_rank = 2000000; // TODO: Remove placeholder

  let lbase_familiarity_rank = placeholder_max_rank / 2;
  const lbase_response = await GetWordFamiliarity(word.word_text);
  if (lbase_response.error) {
    console.log("LBase Error: " + lbase_response.error);
  }
  if (lbase_response.result) {
    lbase_familiarity_rank = parseInt(lbase_response.result, 10);
  }

  const lbase_familiarity_ratio = lbase_familiarity_rank / placeholder_max_rank;

  // MUSE
  const muse_familiarity_ratio_placeholder = 0.5; // TODO: Remove placeholder
  const muse_familiarity_ratio = muse_familiarity_ratio_placeholder;

  // Base Word Difficulty
  const muse_weight = 0.2;
  const lbase_weight = 0.8;
  const MAX_DIFFICULTY = 100;
  const base_word_difficulty_score = MAX_DIFFICULTY * ((muse_weight * muse_familiarity_ratio) + (lbase_weight * lbase_familiarity_ratio));

  // Definition Difficulty
  // TODO: Implement
  const placeholder_definition_multipliers: number[] = Array(word.definitions.length).fill(1);
  const definition_difficulties: number[] = placeholder_definition_multipliers.map((definition_multplier) => definition_multplier * base_word_difficulty_score);

  word.definitions.map((definition, i) => definition.difficulty = definition_difficulties[i]);

  return word;
}