import { Text } from "react-native";

interface Word {
    meta: Meta
    fl: string
    def: Definition[]
    suppl: Supplementary
}

interface Meta {
    id: string
    stems: string[]
}

interface Definition {
    sseq: any[][]
}

interface Supplementary {
    examples: Example[]
}

interface Example {
    t: string
}

function WordDisplay({ word }: { word: Word }) {
    if(word.meta.id != "voluminous"){
        console.log(JSON.stringify(word, null, 2));
    }

    const definition = word.def[0].sseq[0][0][1].dt[0][1];

    return (
        <Text>
            Word: {word.meta.id}
            {"\n"}
            Definition: {definition}
            {"\n"}
            Example: {word.suppl?.examples?.[0]?.t}
        </Text>
    );
}

export default WordDisplay;