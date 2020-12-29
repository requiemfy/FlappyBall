import * as React from 'react';
import { View, Text, Button, StatusBar, BackHandler, Alert, BackHandlerStatic } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FlappyBallGame from '../../../Components/Game/src';
import { NavigationParams, } from 'react-navigation';


export namespace GameMenu {
  type MenuButton = keyof { play: string, resume: string, restart: string };
  type MenuProps = { navigation: NavigationParams; route: { params: { button: MenuButton } } }
  
  class MenuScreen extends React.PureComponent<MenuProps, {}> {
    
    constructor(props: MenuProps) {
      super(props);
    }

    componentDidMount () {
      BackHandler.addEventListener("hardwareBackPress", this.backAction);
    }

    componentWillUnmount () {
      BackHandler.removeEventListener("hardwareBackPress", this.backAction);
    }

    backAction = () => {
      Alert.alert("Hold on!", "Are you sure you want to go back?", [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel"
        },
        { text: "YES", onPress: () => BackHandler.exitApp() }
      ]);
      return true;
    }

    render () {
      const { button } = this.props.route.params;

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
                    title={ button === "play" ? "PLAY" : button === "resume" ? "RESUME" : "RESTART" }
                    onPress={ () => this.props.navigation.navigate("FlappyBall", { button: button }) } />
                  <Button 
                    title="QUIT" 
                    onPress={this.backAction} />
                </View>
              </View>
          </View>
        </View>
      )
    }
    
  }

  function BackGroundScreen({ navigation, route }: any) {
    setTimeout( () => navigation.navigate("Menu", { button: "play" }))
    return (
      <View style={{ 
        alignItems: 'center', 
        justifyContent: 'center' }}>
        <Text style={{ fontSize: 30 }}>BACKGROUND IMAGE HERE</Text>
      </View>
    );
  }

  // const GameScreen = (() => {
  //   let restart = false;
  //   return function ({ navigation, route }: any) {
  //     if (route.params.button === "restart") {
  //       restart = !restart;
  //     } 
  //     if (restart) {
  //       // return <FlappyBallGame key="1" navigation={navigation} route={route}/>;
  //       return null
  //     } else {
  //       return <FlappyBallGame key="0" navigation={navigation} route={route}/>;
  //     }
  //   }
  // })();



  const BackStack = createStackNavigator();
  function BackStackScreen() {
    return (
      <BackStack.Navigator headerMode="none">
        <BackStack.Screen name="BackGround" component={BackGroundScreen} />
      </BackStack.Navigator>
    );
  }

  const RootStack = createStackNavigator();
  export function StackScreen() {
    return (
      <NavigationContainer>
        <RootStack.Navigator 
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: 'transparent' },
            // cardOverlayEnabled: true,
            cardStyleInterpolator: ({ current: { progress } }) => ({
              cardStyle: {
                // opacity: progress.interpolate({
                //   inputRange: [0, 0.5, 0.9, 1],
                //   outputRange: [0, 0.25, 0.7, 1],
                // }),
                opacity: 1,
              },
              overlayStyle: {
                // opacity: progress.interpolate({
                //   inputRange: [0, 1],
                //   outputRange: [0, 0.5],
                //   extrapolate: 'clamp',
                // }),
                opacity: 0.5,
              },
            }),
          }}
          mode="modal" >

          <RootStack.Screen name="BackGround" component={BackStackScreen} />
          <RootStack.Screen name="Menu" component={MenuScreen} />
          <RootStack.Screen name="FlappyBall" component={FlappyBallGame} />

        </RootStack.Navigator>
        <StatusBar hidden />
      </NavigationContainer>
    );
  }

}

