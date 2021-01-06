import * as React from 'react';
import { View, Text, Button, StatusBar, BackHandler, Alert, BackHandlerStatic } from 'react-native';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FlappyBallGame from '../../../Components/Game/src';
import { NavigationParams, } from 'react-navigation';


export namespace GameMenu {
  type MenuButton = keyof { play: string, resume: string, restart: string };
  type MenuProps = { navigation: NavigationParams; route: { params: { button: MenuButton, } } }
  
  class MenuScreen extends React.PureComponent<MenuProps, {}> {
    
    constructor(props: MenuProps) {
      super(props);
    }

    componentDidMount () {
      console.log("MENU SCREEN WILL MOUNT");
      BackHandler.addEventListener("hardwareBackPress", this.backAction);
    }

    componentWillUnmount () {
      console.log("MENU SCREEN WILL UUUUUUUUUUUN-MOUNT");
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

    navigate = () => {
      console.log("navigate menu button pressed")
      const button = this.props.route.params?.button;
      (button === "resume")
        ? this.props.navigation.goBack()
        : this.props.navigation.reset({ 
            index: 0,
            routes: [
              {name: 'FlappyBall', params: { button: button }},
            ],
          });
    }

    render () {
      const button = this.props.route.params?.button;
      console.log("RENDERING: MENU BUTTON PRESSED.")
      return (
        <View style={{ 
          flex: 1, 
          alignItems: 'center', 
          justifyContent: 'center',}}>

          <View style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: "100%",
            // backgroundColor: "red",
            zIndex: 0, }}>
            <Text style={{ fontSize: 30 }}>BACKGROUND IMAGE HERE</Text>
          </View>

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
                    title={button === "restart" ? "RESTART" : button === "resume" ? "RESUME" : "PLAY"}
                    onPress={this.navigate} />
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
          <RootStack.Screen name="Menu" component={MenuScreen} />
          <RootStack.Screen name="FlappyBall" component={FlappyBallGame} />
        </RootStack.Navigator>
        <StatusBar hidden />
      </NavigationContainer>
    );
  }

}

