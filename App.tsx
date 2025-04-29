// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Info from "./app/info";
import Mapa from "./app/mapa";
import HomeScreen from "./app/index"; 

export type RootStackParamList = {
    Home: undefined;
    Info: undefined;
    Mapa: undefined;
  }

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
  <Stack.Navigator initialRouteName="Home">
  <Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="Info" component={Info} />
  <Stack.Screen name="Mapa" component={Mapa} />
</Stack.Navigator>
    </NavigationContainer>
  );
}
