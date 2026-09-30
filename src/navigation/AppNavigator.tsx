import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WordScreen from '../screens/WordScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Word" component={WordScreen} />
    </Stack.Navigator>
  );
}