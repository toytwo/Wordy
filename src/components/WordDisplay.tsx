import { Text, View } from "react-native";
import { ReactNode } from "react";

interface Word {
  meta: Meta;
  hwi: Hwi;
  fl?: string;
  def: Definition[];
  uros?: Uro[];
  et?: EtItem[];
  date?: string;
  ld_link?: Link;
  suppl?: Supplementary;
  shortdef: string[];
}

interface Meta {
  id: string;
  uuid: string;
  sort: string;
  src: string;
  section: string;
  stems: string[];
  offensive: boolean;
}

interface Hwi {
  hw: string;
  prs?: Pronunciation[];
}

interface Pronunciation {
  mw: string;
  sound?: Sound;
}

interface Sound {
  audio: string;
  ref: string;
  stat: string;
}

interface Definition {
  sseq: SenseItem[][];
  vd?: string;
}

type SenseItem =
  | ["sense", Sense]
  | ["bs", { sense: Sense }]
  | ["pseq", SenseItem[]]
  | ["sen", Partial<Sense>];

interface Sense {
  sn?: string;
  dt: DefinitionText[];
  sls?: string[];
  sdsense?: {
    sd: string;
    dt: DefinitionText[];
  };
}

type DefinitionText =
  | ["text", string]
  | ["vis", Example[]]
  | ["snote", DefinitionText[]]
  | ["uns", DefinitionText[][]];

interface Example {
  t: string;
  aq?: unknown;
}

interface Uro {
  ure: string;
  fl: string;
}

type EtItem =
  | ["text", string]
  | ["et_snote", EtNote[]];

interface EtNote {
  t: string;
}

interface Link {
  link_hw: string;
  link_fl: string;
}

interface Supplementary {
  examples?: Example[];
  ldq?: unknown;
}

function cleanText(input: string): string {
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

function flattenSenses(items: SenseItem[]): Sense[] {
  return items.flatMap((item): Sense[] => {
    switch (item[0]) {
      case "sense":
        return [item[1]];
      case "bs":
        return [item[1].sense];
      case "pseq":
        return flattenSenses(item[1]);
      case "sen":
        return [{ dt: [], ...item[1] }];
    }
  });
}

function WordDisplay({ word }: { word: Word }) {
  if (!word) return null;

  const senses = (word.def ?? []).flatMap((d) =>
    flattenSenses(d.sseq.flat())
  );

  const pronunciation = word.hwi.prs?.[0]?.mw;

  return (
    <View style={{ backgroundColor: '#394c5979', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, padding: 10, width: "100%" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        {word.hwi.hw.replace(/\*/g, "·")}
      </Text>

      {pronunciation && <Text>\{pronunciation}\</Text>}
      {word.fl && <Text style={{ fontStyle: "italic" }}>{word.fl}</Text>}

      <DefinitionDisplay senses={senses} />
    </View>
  );
}

const NUM_WIDTH = 20;

function parseSn(sn?: string): { num?: string; letter?: string } {
  const match = sn?.trim().match(/^(\d+)?\s*([a-z])?$/i);
  return { num: match?.[1], letter: match?.[2] };
}

function DefinitionDisplay({ senses }: { senses: Sense[] }) {
  return (
    <View style={{ width: "100%", marginTop: 10 }}>
      {senses.map((sense, i) => {
        const { num, letter } = parseSn(sense.sn);

        return (
          <View key={i} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: "row" }}>
              <View style={{ width: NUM_WIDTH }}>
                {num && (
                  <Text style={{ fontWeight: "bold" }}>
                    {num}
                    {letter ? "" : ":"}
                  </Text>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <DefinitionTextDisplay
                  entries={sense.dt}
                  stub={
                    letter ? (
                      <Text style={{ fontWeight: "bold" }}>{letter}: </Text>
                    ) : undefined
                  }
                />
              </View>
            </View>

            {sense.sdsense && (
              <View style={{ marginLeft: NUM_WIDTH, marginTop: 4 }}>
                <DefinitionTextDisplay
                  entries={sense.sdsense.dt}
                  stub={
                    <Text style={{ fontStyle: "italic" }}>
                      {sense.sdsense.sd}:{" "}
                    </Text>
                  }
                />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function DefinitionTextDisplay({
  entries,
  stub,
}: {
  entries: DefinitionText[];
  stub?: ReactNode;
}) {
  const firstTextIndex = entries.findIndex((e) => e[0] === "text");

  return (
    <>
      {stub && firstTextIndex === -1 && <Text>{stub}</Text>}

      {entries.map((entry, i) => {
        switch (entry[0]) {
          case "text":
            return (
              <Text key={i}>
                {i === firstTextIndex ? stub : null}
                {cleanText(entry[1])}
              </Text>
            );

          case "vis":
            return (
              <View key={i} style={{ marginLeft: 12 }}>
                {entry[1].map((example, j) => (
                  <Text key={j} style={{ fontStyle: "italic" }}>
                    “{cleanText(example.t)}”
                  </Text>
                ))}
              </View>
            );

          case "snote":
            return <DefinitionTextDisplay key={i} entries={entry[1]} />;

          case "uns":
            return entry[1].map((group, j) => (
              <DefinitionTextDisplay key={`${i}-${j}`} entries={group} />
            ));

          default:
            return null;
        }
      })}
    </>
  );
}

export default WordDisplay;