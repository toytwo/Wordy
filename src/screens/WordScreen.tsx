import {View, Text, Button, ScrollView} from 'react-native';
import { getWord } from '../services/dictionaryApi';
import React, { useState } from 'react';
import WordDisplay from '../components/WordDisplay';
import sampleWordData from '../storage/SampleWordData.json'

function WordScreen() {
    const [wordData, setwordData] = useState(sampleWordData);
    const wordInjector: string[] = [];

    const onPress = async () => {
        let newWordData = null;

        if(wordInjector.length > 0){
            newWordData = await getWord(wordInjector.pop());
        }
        else{
            newWordData = await getWord()
        }
        
        setwordData(newWordData);
    };

    if(!wordData){
        return (
            <View style={{flex: 1}}>
                <ScrollView 
                    style={{}}
                    contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}}
                    showsVerticalScrollIndicator={false}
                >
                    <Button 
                        onPress={onPress} 
                        title="New Word" 
                    />
                    <Text>
                        Loading...
                    </Text>
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={{flex: 1}}>
            <ScrollView 
                style={{padding: 5}}
                contentContainerStyle={{gap: 10, justifyContent: 'center', alignItems: 'center'}}
                showsVerticalScrollIndicator={false}
            >
                <Button 
                    onPress={onPress} 
                    title="New Word" 
                />
                <WordDisplay 
                    word={wordData} 
                />
            </ScrollView>
        </View>
    );
}

export default WordScreen;