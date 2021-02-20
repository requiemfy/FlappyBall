import * as React from 'react';
import { View, Text, Button, StatusBar, BackHandler, Alert, BackHandlerStatic, Dimensions, ImageBackground, StyleSheet, LogBox } from 'react-native';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FlappyBallGame from '../../Game/src';
import { NavigationParams, ThemeColors, } from 'react-navigation';
import { PulseIndicator } from 'react-native-indicators';

type HomeButton = keyof { play: string, resume: string, restart: string };
type HomeProps = { navigation: NavigationParams; route: { params: { button: HomeButton, } } }
type HomeState = { loadingBG: boolean}

export default class HomeScreen extends React.PureComponent<HomeProps, HomeState> {

  constructor(props: HomeProps) {
    super(props);
    this.state = { loadingBG: true }
  }

  componentDidMount() {
    console.log("Home SCREEN WILL MOUNT");
  }

  componentWillUnmount() {
    console.log("Home SCREEN WILL UUUUUUUUUUUN-MOUNT");
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

  play = () => {
    this.props.navigation.reset({
      index: 0,
      routes: [
        { name: 'FlappyBall', params: { button: "play" } },
      ],
    });
  }

  goSettings = () => {
    this.props.navigation.navigate('Settings');
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
          backgroundColor: "black",
          width: "100%",
          height: "100%",
          borderRadius: 10,
        }}>
          <ImageBackground 
            source={require('../assets/bg.png')}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
            }}
            onLoadEnd={() => this.setState({ loadingBG: false })}>
          </ImageBackground>
          <View style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}>
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.HomeLabel}>FLAPPY BALL</Text>
            </View>
            <View>
              <View style={[styles.HomeButton]}>
                <Button
                  title="PLAY"
                  color="transparent"
                  onPress={this.play} />
              </View>
              <View style={[styles.HomeButton]}>
                <Button
                  title="Hall of Fame"
                  color="transparent"
                  onPress={() => null} />
              </View>
              <View style={[styles.HomeButton]}>
                <Button
                  title="SETTINGS"
                  color="transparent"
                  onPress={this.goSettings} />
              </View>
              <View style={[styles.HomeButton]}>
                <Button
                  title="QUIT"
                  color="transparent"
                  onPress={this.quit} />
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

const styles = StyleSheet.create({
  HomeLabel: { fontSize: 20, fontWeight: "bold", color: "white" },
  HomeButton: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
    marginTop: 5,
  }
})

