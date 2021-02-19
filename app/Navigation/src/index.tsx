import * as React from 'react';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FlappyBallGame from '../../Screens/Game/src';
import MenuScreen from '../../Screens/Menu/src';
import LoginScreen from '../../Screens/Login/src'
import SignUpScreen from '../../Screens/SignUp/src'
import { StatusBar } from 'react-native';
import HomeScreen from '../../Screens/Home/src';

const RootStack = createStackNavigator();
export default function MainStackScreen() {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: 'black',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          cardStyle: { backgroundColor: 'transparent' },
          cardStyleInterpolator: ({ current: { progress } }) => ({
            cardStyle: { opacity: 1, },
            overlayStyle: { opacity: 0.5, },
          }),
        }}
        mode="modal" >
        <RootStack.Screen
          name="Login"
          component={LoginScreen} 
        />
        <RootStack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{
            headerShown: true,
            title: 'Sign Up Bro'
          }}
        />
        <RootStack.Screen
          name="Home"
          component={HomeScreen}
        />
        <RootStack.Screen
          name="Menu"
          component={MenuScreen}
        />
        <RootStack.Screen name="FlappyBall" component={FlappyBallGame} />
      </RootStack.Navigator>
      <StatusBar hidden />
    </NavigationContainer>
  );
}