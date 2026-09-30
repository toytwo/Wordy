import Config from "react-native-config";

export async function getNewWord(){
    const API_KEY = Config.MERRIAM_WEBSTER_DICTIONARY_API_KEY;
    var word = await nextWord();
    
    try {
        const response = await fetch(
            `https://dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${API_KEY}`,
            
        );
        const json = await response.text();
        return json;
    } 
    catch (error) {
        console.error(error);
    }
};

async function getWordPool(){
    try{
        const response = await fetch(
            "https://api.datamuse.com/words?sp=*&max=1000"
        );
        const json = await response.text();
        return json;
    }
    catch (error){
        console.error(error)
    }
}

async function nextWord(){
    interface MuseWord{
        word: string
        score: number
    }
    
    var museJson = await getWordPool();
    if(!museJson){
        museJson = '[{"name":"test","score":0}]';
    }

    const wordList = JSON.parse(museJson) as MuseWord[];
    
    return wordList[Math.floor(Math.random()*wordList.length)].word;
}