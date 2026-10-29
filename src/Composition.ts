import { DatabaseClient } from "./api/Database/DatabaseClient";
import { MerriamClient } from "./api/MerriamWebster/MerriamClient";
import { MuseClient } from "./api/DataMuse/MuseClient";
import { WordService } from "./services/WordService";
import { LinguabaseClient } from "./api/Linguabase/LinguabaseClient";

const db = new DatabaseClient();
const merriam = new MerriamClient();

// Weights should sum to 1
const muse = new MuseClient(0.2);
const lbase = new LinguabaseClient(0.8);

export const wordService = new WordService(
  merriam,
  [muse, lbase],
  muse,
  db,
);