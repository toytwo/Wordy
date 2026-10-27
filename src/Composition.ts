import { DatabaseClient } from "./api/Database/DatabaseClient";
import { MerriamClient } from "./api/MerriamWebster/MerriamClient";
import { MuseClient } from "./api/DataMuse/MuseClient";
import { WordService } from "./services/WordService";
import { LinguabaseClient } from "./api/Linguabase/LinguabaseClient";

const db = new DatabaseClient();
const merriam = new MerriamClient();
const muse = new MuseClient();
const lbase = new LinguabaseClient();

export const wordService = new WordService(
  merriam,
  [muse, lbase],
  muse,
  db,
);