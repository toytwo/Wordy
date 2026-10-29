import { Text, View } from "react-native";
import * as DB from "../types/DatabaseTypes";

function WordDisplay({ word, word_text, index, max_index }: { word: DB.PartialWord, word_text: string, index: number, max_index: number }) {
  if (!word) {
    return null;
  }

  const headword = word_text;
  const syllableSplit = word.syllable_split;
  const pronunciation = word.pronunciation;

  return (
    <View
      style={{
        backgroundColor: "#394c5979",
        borderRadius: 20,
        padding: 10,
        width: "100%",
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>{`${headword} (${index + 1} of ${max_index})`}</Text>

      <View style={{ flexDirection: "row" }}>
        {!!syllableSplit && <Text>({syllableSplit}) </Text>}
        {!!pronunciation && <Text>\{pronunciation}\</Text>}
      </View>

      <View style={{ width: "100%", marginTop: 10 }}>
        <Text style={{ fontStyle: "italic", marginBottom: 4 }}>
          {word.word_type}
        </Text>

        <DefinitionDisplay definitions={word.definitions} />
      </View>
    </View>
  );
}

function DefinitionDisplay({ definitions }: { definitions: DB.Definition[] }) {
  return (
    <View style={{ width: "100%" }}>
      {definitions.map((definition, i) => {
        const prev = definitions[i - 1];
        const newGroup = !prev || prev.group_number !== definition.group_number;

        const label = [
          definition.subgroup_letter,
          definition.subsubgroup_number !== null
            ? `(${definition.subsubgroup_number})`
            : null,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <View key={i} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontWeight: "bold" }}>
                {newGroup ? definition.group_number : "  "}
              </Text>

              <View style={{ flex: 1 }}>
                <Text>
                  <Text style={{ fontWeight: "bold" }}>
                    {label ? ` ${label}` : ""}
                    {" : "}
                  </Text>

                  {definition.definition_text}
                </Text>

                {definition.examples.length > 0 && (
                  <View style={{ marginLeft: 12 }}>
                    {definition.examples.map((example, j) => (
                      <Text key={j} style={{ fontStyle: "italic" }}>
                        “{example}”
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default WordDisplay;