import { View, Text, Button, ScrollView } from 'react-native';
import { wordService } from '../Composition';
import React, { useState } from 'react';
import WordDisplay from '../components/WordDisplay';
import { Word } from '../types/DatabaseTypes';

const wordInjector: string[] = ["antiseptic", "bear"];

function WordScreen() {
  const [wordData, setwordData] = useState<Word | null>(null);

  const onPress = async () => {
    const injectorWord = wordInjector.pop();

    if (injectorWord) {
      setwordData(await wordService.GetWord(injectorWord));
    }
    else {
      setwordData(await wordService.GetRandomWord());
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

        {wordData.map((partial_word, i) => 
          <WordDisplay
            word={partial_word}
            key={i}
            index={i}
            max_index={wordData.length}
          />
        )}
      </ScrollView>
    </View>
  );
}

export default WordScreen;