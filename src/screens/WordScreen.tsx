import {View, Text, Button} from 'react-native';
import { getNewWord } from '../services/dictionaryApi';
import React, { useState } from 'react';
import WordDisplay from '../components/WordDisplay';
import sampleWordData from '../storage/SampleWordData.json'

function WordScreen() {
    const [wordData, setwordData] = useState(sampleWordData);

    const onPress = async () => {
        var newWord = await getNewWord();
        if (!newWord){
            newWord = sampleWordData;
        }
        setwordData(newWord);
    };

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: "center"}}>
            <Button 
                onPress={onPress}
                title="New Word"
            />
            <WordDisplay
                word = {wordData}
            />
        </View>
    );
}

export default WordScreen;