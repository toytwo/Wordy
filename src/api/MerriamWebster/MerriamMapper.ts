import * as DB from "../../types/DatabaseTypes";
import * as Merriam from "./MerriamTypes";

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
  if (fl) {
    return fl.toLowerCase() as DB.WordType;
  }

  return "noun"
}

export function MerriamWordToDBWord(result: Merriam.Word, word_text: string): DB.WordDraft {
  const target = word_text.toLowerCase();

  const filtered_result = result.filter(
    (entry) => entry.meta.id.split(":")[0] === target // Do not convert to lower case here, sometimes merriam includes proper nouns 
                                                      // which are always capitalized while normal entries are lower case in api results
  );
  let word_draft: DB.PartialWordDraft[] = Array(filtered_result.length);
  let index = 0;
  for (const word of filtered_result){
    word_draft[index] = {
      definitions: MerriamDefinitionsToDBDefinitions(word.def),
      word_text: word.hwi.hw.replace(/\*/g, ""),
      stems: word.meta.stems,
      offensive: word.meta.offensive,
      pronunciation: word.hwi.prs?.[0]?.mw ?? "",
      syllable_split: word.hwi.hw.replace(/\*/g, "·"),
      word_type: ToWordType(word.fl)
    };
    index++;
  }
  
  return word_draft;
}

function ParseDefinitionText(dt: Merriam.DefinitionText[] | undefined, out: { texts: string[]; examples: string[] }): void {
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

function MerriamDefinitionsToDBDefinitions(definitions: Merriam.Definition[]): DB.DefinitionDraft[] {
  const result: DB.DefinitionDraft[] = [];
  let currentGroup = 1;
  let currentLetter: string | null = null;

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

        let subgroup: string | null = null;
        let subsubgroup: number | null = null;

        if (sense.sn) {
          const m = sense.sn.match(/^(?:(\d+)\s*)?(?:([a-z])\s*)?(?:\((\d+)\))?$/);
          if (m) {
            const [, num, letter, sub] = m;
            if (num) {
              currentGroup = parseInt(num, 10);
              currentLetter = null;
            }
            if (letter) currentLetter = letter;
            subgroup = currentLetter;
            subsubgroup = sub ? parseInt(sub, 10) : null;
          }
        }

        result.push({
          group_number: currentGroup,
          subgroup_letter: subgroup,
          subsubgroup_number: subsubgroup,
          definition_text: text,
          examples: parsed.examples,
        });
      }
    }
  }
  return result;
}