import * as DB from "../types/DatabaseTypes";
import * as Merriam from "../types/MerriamTypes";

const DEFAULT_UNASSIGNED_VALUE = 0;

// TODO: 1) Change back default to -1
//       2) Add difficulty assignment in word service

function CleanText(input: string): string {
  return input
    .replace(/\{bc\}/g, ": ")
    .replace(/\{ldquo\}/g, "“")
    .replace(/\{rdquo\}/g, "”")
    .replace(
      /\{(?:a_link|d_link|i_link|et_link|mat|sx|dxt|dx_def)\|([^|}]*)[^}]*\}/g,
      "$1"
    )
    .replace(/\{ds\|[^}]*\}/g, "")
    .replace(/\{\/?(?:wi|it|b|inf|sup|sc|phrase|qword|gloss)\}/g, "")
    .replace(/\{[^}]*\}/g, "")
    .replace(/^:\s*/, "")
    .trim();
}

function ToWordType(fl: string | undefined): DB.WordType {
<<<<<<< HEAD
  if(fl){
    return fl.toLowerCase() as DB.WordType;
  }
  
=======
  if (fl) {
    return fl.toLowerCase() as DB.WordType;
  }

>>>>>>> feature/Database
  return "noun"
}

export function MerriamWordToDBWord(word: Merriam.Word): DB.Word {
  const wordType = ToWordType(word.fl);
  return {
    word_id: DEFAULT_UNASSIGNED_VALUE,
    definitions: MerriamDefinitionsToDBDefinitions(word.def, wordType),
    word_text: word.hwi.hw.replace(/\*/g, ""),
    stems: MerriamStemsToDBStems(word.meta.stems, wordType),
    offensive: word.meta.offensive,
    pronunciation: word.hwi.prs?.[0]?.mw ?? "",
<<<<<<< HEAD
    syllable_split: word.hwi.hw,
=======
    syllable_split: word.hwi.hw.replace(/\*/g, "·"),
>>>>>>> feature/Database
  };
}

function ParseDefinitionText(
  dt: Merriam.DefinitionText[] | undefined,
  out: { texts: string[]; examples: string[] }
): void {
  for (const item of dt ?? []) {
    switch (item[0]) {
      case "text": {
        const cleaned = CleanText(item[1]);
        if (cleaned) out.texts.push(cleaned);
        break;
      }
      case "vis":
        for (const ex of item[1]) {
          const cleaned = CleanText(ex.t);
          if (cleaned) out.examples.push(cleaned);
        }
        break;
      case "snote":
        ParseDefinitionText(item[1], { texts: [], examples: out.examples });
        break;
      case "uns":
        for (const group of item[1]) ParseDefinitionText(group, out);
        break;
    }
  }
}

function FlattenSenses(items: Merriam.SenseItem[]): Partial<Merriam.Sense>[] {
  const result: Partial<Merriam.Sense>[] = [];
  for (const item of items) {
    switch (item[0]) {
      case "sense":
        result.push(item[1]);
        break;
      case "bs":
        result.push(item[1].sense);
        break;
      case "sen":
        result.push(item[1]);
        break;
      case "pseq":
        result.push(...FlattenSenses(item[1]));
        break;
    }
  }
  return result;
}

function MerriamDefinitionsToDBDefinitions(
  definitions: Merriam.Definition[],
  wordType: DB.WordType
): DB.Definition[] {
  const result: DB.Definition[] = [];
  let currentGroup = 1;

  for (const definition of definitions ?? []) {
    for (const senseItems of definition.sseq) {
      for (const sense of FlattenSenses(senseItems)) {
        const parsed = { texts: [] as string[], examples: [] as string[] };
        ParseDefinitionText(sense.dt, parsed);
        if (sense.sdsense) {
          if (sense.sdsense.sd) parsed.texts.push(`(${sense.sdsense.sd})`);
          ParseDefinitionText(sense.sdsense.dt, parsed);
        }

        const text = parsed.texts.join(" ").trim();
        if (!text) continue;

<<<<<<< HEAD
        let subgroup = "";
=======
        let subgroup: string | null = null;
>>>>>>> feature/Database
        if (sense.sn) {
          const match = sense.sn.match(/^(\d+)\s*(.*)$/);
          if (match) {
            currentGroup = parseInt(match[1], 10);
<<<<<<< HEAD
            subgroup = match[2];
=======
            subgroup = match[2] || null;
>>>>>>> feature/Database
          } else {
            subgroup = sense.sn;
          }
        }

        result.push({
          word_id: DEFAULT_UNASSIGNED_VALUE,
          definition_id: DEFAULT_UNASSIGNED_VALUE,
          word_type: wordType,
<<<<<<< HEAD
          group: currentGroup,
          subgroup,
          definition_text: text,
          difficulty: 0,
          user_understanding: 0,
=======
          group_number: currentGroup,
          subgroup_letter: subgroup,
          definition_text: text,
          difficulty: DEFAULT_UNASSIGNED_VALUE,
          user_understanding: DEFAULT_UNASSIGNED_VALUE,
>>>>>>> feature/Database
          examples: parsed.examples.map((example_text) => ({
            definition_id: DEFAULT_UNASSIGNED_VALUE,
            example_id: DEFAULT_UNASSIGNED_VALUE,
            example_text,
          })),
        });
      }
    }
  }
  return result;
}

function MerriamStemsToDBStems(
  stems: string[],
  wordType: DB.WordType
): DB.Stem[] {
  return stems.map((stem) => ({
    word_id: DEFAULT_UNASSIGNED_VALUE,
    stem_id: DEFAULT_UNASSIGNED_VALUE,
    stem_text: stem,
    word_type: wordType,
  }));
}