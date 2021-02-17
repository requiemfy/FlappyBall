import * as React from 'react';
import { View, Text, Button, StatusBar, BackHandler, Alert, BackHandlerStatic, Dimensions, ImageBackground, StyleSheet } from 'react-native';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FlappyBallGame from '../../../Components/Game/src';
import { NavigationParams, } from 'react-navigation';
import PulseIndicator from 'react-native-indicators';


export namespace GameMenu {
  type MenuButton = keyof { play: string, resume: string, restart: string };
  type MenuProps = { navigation: NavigationParams; route: { params: { button: MenuButton, } } }
  type MenuState = { loadingBG: boolean}

  class MenuScreen extends React.PureComponent<MenuProps, MenuState> {

    constructor(props: MenuProps) {
      super(props);
      this.state = { loadingBG: true }
    }

    componentDidMount() {
      console.log("MENU SCREEN WILL MOUNT");
      BackHandler.addEventListener("hardwareBackPress", this.backAction);
    }

    componentWillUnmount() {
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
            { name: 'FlappyBall', params: { button: button } },
          ],
        });
    }

    render() {
      const button = this.props.route.params?.button;
      return (
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {
            button !== "restart" && button !== "resume"
              ? <ImageBackground source={require('../assets/bg.png')}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                  }}
                  onLoadEnd={() => this.setState({ loadingBG: false })}>
              </ImageBackground>
              : null
          }
          <View style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            width: "70%",
            height: "50%",
            borderRadius: 10,
          }}>
            <View style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}>
              <View style={{
                marginBottom: 20
              }}>
                {
                  button === "restart"
                    ? <Text style={{ fontSize: 30, fontWeight: "bold", color: "white" }}>That's Life</Text>
                    : button === "resume"
                      ? <Text style={styles.menuLabel}>PAUSED</Text>
                      : <Text style={styles.menuLabel}>FLAPPY BALL</Text>
                }
              </View>
              <View>
                <View style={[styles.menuButton]}>
                  <Button
                    title={button === "restart" ? "RESTART" : button === "resume" ? "RESUME" : "PLAY"}
                    color="transparent"
                    onPress={this.navigate} />
                </View>
                <View style={[styles.menuButton]}>
                  <Button
                    title="QUIT"
                    color="transparent"
                    onPress={this.backAction} />
                </View>
              </View>
            </View>
          </View>
          {
            this.state.loadingBG && button !== "restart" && button !== "resume"
              ? <View style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  backgroundColor: "black",
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                  <PulseIndicator color='white'/>
                </View>
              : null
          }
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
}

const styles = StyleSheet.create({
  menuLabel: { fontSize: 20, fontWeight: "bold", color: "white" },
  menuButton: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
    marginTop: 5,
  }
})

