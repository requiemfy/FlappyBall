import * as React from 'react';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FlappyBallGame from '../../Screens/Game/src';
import MenuScreen from '../../Screens/Menu/src';
import { StatusBar } from 'react-native';

const RootStack = createStackNavigator();
export default function MainStackScreen() {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: 'transparent' },
          cardStyleInterpolator: ({ current: { progress } }) => ({
            cardStyle: { opacity: 1, },
            overlayStyle: { opacity: 0.5, },
          }),
        }}
        mode="modal" >
        <RootStack.Screen name="Menu" component={MenuScreen} />
        <RootStack.Screen name="FlappyBall" component={FlappyBallGame} />
      </RootStack.Navigator>
      <StatusBar hidden />
    </NavigationContainer>
  );
}