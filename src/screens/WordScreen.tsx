import {View, Text, Button} from 'react-native';
import { getNewWord } from '../services/dictionaryApi';
import React, { useState } from 'react';

function WordScreen() {
    const [jsonResponse, setJsonResponse] = useState("Nothing");

    const onPress = async () => {
        var newWord = await getNewWord();
        if (!newWord){
            newWord = "Nothing"
        }
        setJsonResponse(newWord);
    };

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: "center"}}>
            <Button 
                onPress={onPress}
                title="New Word"
            />
            <Text>
                {`${jsonResponse}`}
            </Text>
        </View>
    );
}

export default WordScreen;