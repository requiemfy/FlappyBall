import * as React from 'react';
import { View, Text, Button, StatusBar, BackHandler, Alert, BackHandlerStatic, Dimensions, ImageBackground, StyleSheet } from 'react-native';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FlappyBallGame from '../../Game/src';
import { NavigationParams, } from 'react-navigation';
import { PulseIndicator } from 'react-native-indicators';

type MenuButton = keyof { play: string, resume: string, restart: string };
type MenuProps = { navigation: NavigationParams; route: { params: { button: MenuButton, } } }
type MenuState = { loadingBG: boolean}

export default class MenuScreen extends React.PureComponent<MenuProps, MenuState> {

  constructor(props: MenuProps) {
    super(props);
  }

  componentDidMount() {
    console.log("MENU SCREEN WILL MOUNT");
  }

  componentWillUnmount() {
    console.log("MENU SCREEN WILL UUUUUUUUUUUN-MOUNT");
  }

  quit = () => {
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
    const button = this.props.route.params?.button;
    (button === "resume")
      ? this.props.navigation.goBack() // resume
      : this.props.navigation.reset({ // restart
        index: 0,
        routes: [
          { name: 'FlappyBall', params: { button: button } },
        ],
      });
  }

  goHome = () => {
    this.props.navigation.reset({
      index: 0,
      routes: [
        { name: 'Home' },
      ],
    })
  }

  render() {
    const button = this.props.route.params?.button;
    return (
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
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
                  title={button === "restart" ? "RESTART" : button === "resume" ? "RESUME" : "HOME"}
                  color="transparent"
                  onPress={this.navigate} />
              </View>
              <View style={[styles.menuButton]}>
                <Button
                  title="Hall of Fame"
                  color="transparent"
                  onPress={() => null} />
              </View>
              <View style={[styles.menuButton]}>
                <Button
                  title="Home"
                  color="transparent"
                  onPress={this.goHome} />
              </View>
              <View style={[styles.menuButton]}>
                <Button
                  title="QUIT"
                  color="transparent"
                  onPress={this.quit} />
              </View>
            </View>
          </View>
        </View>
      </View>
    )
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

