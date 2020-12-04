import * as React from 'react';
import { View, Text, Button, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FlappyBallGame from '../../OnGame/src';
import { exp } from 'react-native-reanimated';

export namespace GameMenu {

  function BackGroundScreen({ navigation }: any) {
    setTimeout( () => navigation.navigate('Menu'), 500);
    return (
      <View style={{ 
        alignItems: 'center', 
        justifyContent: 'center' }}>
        <Text style={{ fontSize: 30 }}>BACKGROUND IMAGE HERE</Text>
      </View>
    );
  }

  function MenuScreen({ navigation }: any) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{
          backgroundColor: "yellow",
          width: "70%",
          height: "50%", }}>
          <View style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center", }}>
              <View><Text>FLAPPY BALL</Text></View>
              <View>
                <Button 
                  title="SOLO GAME" 
                  onPress={ () => navigation.navigate('FlappyBall') } />
              </View>
            </View>
        </View>
      </View>
    );
  }

  function GameScreen({ navigation }: any) {
    return <FlappyBallGame />
  }

  const MainStack = createStackNavigator();
  const RootStack = createStackNavigator();

  function BackStackScreen() {
    return (
      <MainStack.Navigator headerMode="none">
        <MainStack.Screen name="BackGround" component={BackGroundScreen} />
      </MainStack.Navigator>
    );
  }

  export function StackScreen() {
    return (
      <NavigationContainer>
        <RootStack.Navigator 
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
            cardStyleInterpolator: ({ current: { progress } }) => ({
              cardStyle: {
                opacity: progress.interpolate({
                  inputRange: [0, 0.5, 0.9, 1],
                  outputRange: [0, 0.25, 0.7, 1],
                }),
              },
              overlayStyle: {
                opacity: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                  extrapolate: 'clamp',
                }),
              },
            }),
          }}
          mode="modal" >
          <RootStack.Screen name="BackGround" component={BackStackScreen} />
          <RootStack.Screen name="Menu" component={MenuScreen} />
          <RootStack.Screen name="FlappyBall" component={GameScreen} />
        </RootStack.Navigator>
        <StatusBar hidden />
      </NavigationContainer>
    );
  }

}

