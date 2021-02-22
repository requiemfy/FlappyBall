import * as React from 'react';
import { View, Text, Button, StatusBar, BackHandler, Alert, Dimensions, ImageBackground, StyleSheet, LogBox } from 'react-native';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FlappyBallGame from '../../Game/src';
import { NavigationParams, ThemeColors, } from 'react-navigation';
import { PulseIndicator } from 'react-native-indicators';
import { firebase } from '../../../src/firebase'

type HomeButton = keyof { play: string; resume: string; restart: string };
type HomeProps = { navigation: NavigationParams; route: { params: { button: HomeButton; } } }
type HomeState = { 
  loadingBG: boolean;
  user: { 
    loading: boolean; 
    error: boolean; 
    codeName: string; 
    record: number 
  }; 
}

export default class HomeScreen extends React.PureComponent<HomeProps, HomeState> {
  user = firebase.auth().currentUser;

  constructor(props: HomeProps) {
    super(props);
    this.state = { 
      loadingBG: true, 
      user: {
        loading: true,
        error: true,
        codeName: "",
        record: 0
      } 
    }
  }

  componentDidMount() {
    console.log("Home SCREEN WILL MOUNT");
    this.getUserData();
  }

  componentWillUnmount() {
    console.log("Home SCREEN WILL UUUUUUUUUUUN-MOUNT");
  }

  getUserData = () => {
    firebase
    .database()
    .ref('users/' + this.user?.uid)
    .once('value')
    .then(snapshot => {
      const user = snapshot.val();
      this.setState({ user: {
        loading: false,
        error: false,
        codeName: user.codeName, 
        record: user.record
      }})
    })
    .catch(err => {
      this.setState({
        user: {
          ...this.state.user, 
          loading: false, 
          error: true
        }
      })
    });
  }

  quit = () => {
    Alert.alert("Hold on!", "Are you sure you want to quit?", [
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

  goHallOfFame = () => {
    this.props.navigation.navigate('HallOfFame');
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
            <View style={{ flex: 1, justifyContent: "center", }}>
              <Text style={{ 
                fontSize: 40, 
                fontWeight: "bold", 
                color: "white" 
              }}>FLAPPY BALL</Text>
            </View>
            <View style={{ flex: 1, justifyContent: "center", }}>
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
                  onPress={this.goHallOfFame} />
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
            <View style={{ 
              flex: 1, 
              marginTop: 30,
              justifyContent: "center",
              alignItems: "center"
            }}>
              {
                this.state.user.error
                  ? <Text style={{color: "white"}}>Error getting data</Text>
                  : <View>
                      <Text style={styles.txt}>{this.state.user.codeName}</Text>
                      <Text style={{ color: "white", textAlign: "center", marginTop: 5 }}>Highest score:</Text>
                      <Text style={styles.txt}>{this.state.user.record}</Text>
                    </View>
              }
            </View>
          </View>
        </View>
        {
          this.state.loadingBG || this.state.user.loading
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
  HomeButton: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
    marginTop: 5,
  },
  txt: { 
    textAlign: "center", 
    color: "white" ,
    fontSize: 25,
    fontWeight: "bold",
  }
})

