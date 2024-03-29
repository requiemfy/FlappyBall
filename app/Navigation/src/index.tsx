import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FlappyBallGame from '../../Screens/Game/src';
import MenuScreen from '../../Screens/Menu/src';
import LoginScreen from '../../Screens/Login/src';
import SignUpScreen from '../../Screens/SignUp/src';
import SettingScreen from '../../Screens/Settings/src';
import { StatusBar } from 'react-native';
import HomeScreen from '../../Screens/Home/src';
import HallOfFameScreen from '../../Screens/HallOfFame/src';
import InventoryScreen from '../../Screens/Inventory/src';
import ShopScreen from '../../Screens/Shop/src';

const RootStack = createStackNavigator();
export default function MainStackScreen(props: { initRoute: string }) {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName={props.initRoute}
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
          name="Settings"
          component={SettingScreen}
          options={{
            headerShown: true,
            title: 'Settings'
          }}
        />
        <RootStack.Screen
          name="Inventory"
          component={InventoryScreen}
          options={{
            headerShown: true,
            title: 'Inventory'
          }}
        />
        <RootStack.Screen
          name="Shop"
          component={ShopScreen}
          options={{
            headerShown: true,
            title: 'Shop'
          }}
        />
        <RootStack.Screen
          name="Menu"
          component={MenuScreen}
        />
        <RootStack.Screen
          name="HallOfFame"
          component={HallOfFameScreen}
        />
        <RootStack.Screen 
          name="FlappyBall" 
          component={FlappyBallGame} 
        />
      </RootStack.Navigator>
      <StatusBar hidden />
    </NavigationContainer>
  );
}