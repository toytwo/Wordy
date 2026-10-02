import Config from "react-native-config";

interface MuseWord {
    word: string;
    score: number;
}

export async function getWord(word?: string) {
    const API_KEY = Config.MERRIAM_WEBSTER_DICTIONARY_API_KEY;

    if(!word){
        word = await newWord();
    }

    for (let i = 0; i < 10; i++) {
        if (!word) {
            return null;
        }

        console.log("Requesting:", word);

        try {
            const response = await fetch(
                `https://dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${API_KEY}`
            );

            const json = await response.json();

            console.log("Recieved:", json);

            if (Array.isArray(json) && json[0]?.meta) {
                console.log("FIRST:", json[0]);
                return json[0];
            }

            if (Array.isArray(json) && typeof json[0] === "string") {
                word = json[0];
                continue;
            }

            return null;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    return null;
}

async function getWordPool() {
    try {
        const response = await fetch(
            "https://api.datamuse.com/words?sp=*&max=1000"
        );

        const json = await response.text();

        return json;
    } catch (error) {
        console.error(error);
    }
}

async function newWord() {
    var museJson = await getWordPool();

    if (!museJson) {
        museJson = '[{"word":"test","score":0}]';
    }

    const wordList = (JSON.parse(museJson) as MuseWord[])
        .filter((word) => /^[A-Za-z]+$/.test(word.word));

    return wordList[Math.floor(Math.random() * wordList.length)].word;
}