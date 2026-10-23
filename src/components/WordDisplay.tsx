import { Text, View } from "react-native";
import * as DB from "../types/DatabaseTypes";

function WordDisplay({ word }: { word: DB.Word }) {
  if (!word) return null;

  const headword = word.word_text;

  return (
    <View
      style={{
        backgroundColor: "#394c5979",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        padding: 10,
        width: "100%",
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>{headword}</Text>

      <View style={{ flexDirection: "row" }}>
        {word.syllable_split && <Text>({word.syllable_split}) </Text>}
        {word.pronunciation && <Text>\{word.pronunciation}\</Text>}
      </View>

      <DefinitionDisplay definitions={word.definitions} />
    </View>
  );
}

function DefinitionDisplay({ definitions }: { definitions: DB.Definition[] }) {
  return (
    <View style={{ width: "100%", marginTop: 10 }}>
      {definitions.map((definition, i) => {
        const prev = definitions[i - 1];

        const newWordType = !prev || prev.word_type !== definition.word_type;
        const newGroup = !prev || prev.group_number !== definition.group_number;

        return (
          <View key={i} style={{ marginBottom: 10 }}>
            {newWordType && definition.word_type && (
              <Text style={{ fontStyle: "italic", marginBottom: 4 }}>
                {definition.word_type}
              </Text>
            )}

            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontWeight: "bold" }}>
                {newGroup
                  ?
                  definition.group_number
                  :
                  "  "
                }
              </Text>

              <View style={{ flex: 1 }}>
                <Text>
                  <Text style={{ fontWeight: "bold" }}>
                    {definition.subgroup_letter &&
                      ` ${definition.subgroup_letter}`}
                    {" : "}
                  </Text>

                  {definition.definition_text}
                </Text>

                {definition.examples?.length > 0 && (
                  <View style={{ marginLeft: 12 }}>
                    {definition.examples.map((example, j) => (
                      <Text
                        key={j}
                        style={{ fontStyle: "italic" }}
                      >
                        “{example.example_text}”
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