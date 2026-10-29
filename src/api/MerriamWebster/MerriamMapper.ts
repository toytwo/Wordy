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

function IsWordType(value: string): value is DB.WordType {
  return (DB.WORD_TYPES as readonly string[]).includes(value);
}

/**
 * Picks the word type for a definition block.
 * Prefers the block's own label (vd, e.g. "transitive verb"),
 * then the entry's part of speech (fl), then defaults to "noun".
 */
function ToWordType(vd: string | undefined, fl: string | undefined): DB.WordType {
  const vdNormalized = vd?.trim().toLowerCase();
  if (vdNormalized && IsWordType(vdNormalized)) {
    return vdNormalized;
  }

  const flNormalized = fl?.trim().toLowerCase();
  if (flNormalized) {
    // Same behavior as before: unknown values like "phrase" pass through unchanged
    return flNormalized as DB.WordType;
  }

  return "noun";
}

export function MerriamWordToDBWord(result: Merriam.Word, word_text: string): DB.WordDraft {
  const target = word_text.toLowerCase();

  const filtered_result = result.filter(
    (entry) => entry.meta.id.split(":")[0] === target
    // Do not convert entry to lower case. Sometimes merriam includes proper nouns
    // which are always capitalized while normal entries are always lower case in api results
  );

  const partials: DB.PartialWord[] = [];

  for (const entry of filtered_result) {
    const pronunciation = entry.hwi.prs?.[0]?.mw ?? "";
    const syllable_split = entry.hwi.hw.replace(/\*/g, "·");
    const entryPartials: DB.PartialWord[] = [];

    // One partial per definition block, so "transitive verb" and
    // "intransitive verb" become separate entries.
    for (const block of entry.def ?? []) {
      // Passing a single block restarts group/letter numbering for each one
      const definitions = MerriamDefinitionsToDBDefinitions([block]);
      if (definitions.length === 0) continue;

      entryPartials.push({
        definitions,
        stems: [],
        offensive: entry.meta.offensive,
        pronunciation,
        syllable_split,
        word_type: ToWordType(block.vd, entry.fl)
      });
    }

    // Entries with no usable definition blocks (e.g. "past tense of bear")
    // still produce one partial, as before.
    if (entryPartials.length === 0) {
      entryPartials.push({
        definitions: [],
        stems: [],
        offensive: entry.meta.offensive,
        pronunciation,
        syllable_split,
        word_type: ToWordType(undefined, entry.fl)
      });
    }

    // Stems are entry-level, so attach them once to avoid storing duplicates
    entryPartials[0].stems = entry.meta.stems;

    partials.push(...entryPartials);
  }

  const word_draft: DB.WordDraft = {
    partials,
    word_text: filtered_result[0].hwi.hw.replace(/\*/g, "")
  };

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

function MerriamDefinitionsToDBDefinitions(definitions: Merriam.Definition[]): DB.Definition[] {
  const result: DB.Definition[] = [];
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