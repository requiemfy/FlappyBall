import * as React from 'react';
import { View, Text, Button, StatusBar, BackHandler, Alert, BackHandlerStatic, Dimensions, ImageBackground, StyleSheet, NativeEventSubscription } from 'react-native';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FlappyBallGame from '../../Game/src';
import { NavigationParams, } from 'react-navigation';
import { PulseIndicator } from 'react-native-indicators';
import { firebase, UserData } from '../../../src/firebase';

type MenuButton = keyof { play: string, resume: string, restart: string };
type Props = { 
  navigation: NavigationParams; 
  route: { 
    params: { 
      button: MenuButton; 
      connection: string;
      score?: number;
    }
  }
}
type State = { newHighScore: boolean}

export default class MenuScreen extends React.PureComponent<Props, State> {
  database = firebase.database();
  user = firebase.auth().currentUser;
  score = this.props.route.params?.score;
  stateButton = this.props.route.params.button;
  connection = this.props.route.params.connection;
  backHandler!: NativeEventSubscription;

  constructor(props: Props) {
    super(props);
    this.state = {
      newHighScore: false,
    }
  }

  componentDidMount() {
    console.log("MENU SCREEN WILL MOUNT");
    this.score ? this.hasNewHighScore() : null;
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.backAction);
  }

  componentWillUnmount() {
    console.log("MENU SCREEN WILL UUUUUUUUUUUN-MOUNT");
    this.backHandler.remove();
  }

  backAction = () => {
    this.props.navigation.goBack();
    return true;
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

  goHallOfFame = () => {
    this.props.navigation.navigate('HallOfFame');
  }

  logIn = () => {
    this.props.navigation.reset({ 
      index: 0,
      routes: [{ name: 'Login' }],
    }) 
  }

  hasNewHighScore = () => {
    this.database
      .ref('users/' + this.user?.uid + "/record")
      .once('value')
      .then(snapshot => {
        const record = snapshot.val() as number;
        if (this.score! > record) {
          this.setState({ newHighScore: true });
          this.database
            .ref('users/' + this.user?.uid)
            .update({ record: this.score })
            .then(snapshot => {
              console.log("SIGN UP SUCCESS", snapshot);
            })
            .catch(err => {
              console.log("SIGN UP FAILED", err);
            })
        }
      })
      .catch(err => {
        console.log(err)
      });
  }

  render() {
    return (
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <View style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          width: "90%",
          height: "90%",
          borderRadius: 10,
        }}>
          <View style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}>
            <View>
              {
                this.stateButton === "restart"
                  ? <View style={{ alignItems: "center" }}>
                      <Text style={styles.menuLabel}>That's Life</Text>
                      <Text style={{...styles.menuLabel, fontSize: 50}}>{this.score}</Text>
                      {
                        this.state.newHighScore
                          ? <Text style={{...styles.menuLabel, fontSize: 15}}>Oh it's a NEW HIGH SCORE!!</Text>
                          : null
                      }
                    </View>
                  : this.stateButton === "resume"
                    ? <Text style={styles.menuLabel}>PAUSED</Text>
                    : null
              }
            </View>
            <View>
              <View style={[styles.menuButton]}>
                <Button
                  title={this.stateButton === "restart" ? "RESTART" : this.stateButton === "resume" ? "RESUME" : "HOME"}
                  color="transparent"
                  onPress={this.navigate} />
              </View>
              {
                this.connection === "online"
                ? <View>
                    <View style={[styles.menuButton]}>
                      <Button
                        title="Hall of Fame"
                        color="transparent"
                        onPress={this.goHallOfFame} />
                    </View>
                    <View style={[styles.menuButton]}>
                      <Button
                        title="Home"
                        color="transparent"
                        onPress={this.goHome} />
                    </View>
                  </View>
                : <View style={[styles.menuButton]}>
                    <Button
                      title="Log In"
                      color="transparent"
                      onPress={this.logIn} />
                  </View>
              }
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

