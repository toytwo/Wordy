import { View, Text, Button, ScrollView } from 'react-native';
import { GetRandomWord, GetWord } from '../services/WordService';
import React, { useState } from 'react';
import WordDisplay from '../components/WordDisplay';
import sampleWordData from '../data/SampleWordData.json'
import { MerriamWordToDBWord } from '../services/TypeConverter';
import * as Merriam from "../types/MerriamTypes"

const wordInjector: string[] = ["antiseptic", "bear"];

function WordScreen() {
  const [wordData, setwordData] = useState(MerriamWordToDBWord(sampleWordData as Merriam.Word));

  const onPress = async () => {
    const injectorWord = wordInjector.pop();

    if (injectorWord) {
      setwordData(await GetWord(injectorWord));
    }
    else {
      setwordData(await GetRandomWord());
    }
  };

  if (!wordData) {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{}}
          contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}
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
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ padding: 5 }}
        contentContainerStyle={{ gap: 10, justifyContent: 'center', alignItems: 'center' }}
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