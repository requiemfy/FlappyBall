import * as React from 'react';
import { View, Text, Button, BackHandler, Alert, StyleSheet, NativeEventSubscription } from 'react-native';
import { NavigationParams, } from 'react-navigation';
import { firebase } from '../../../src/firebase';
import { backOnlyOnce } from '../../helpers';

type MenuButton = keyof { resume: string, restart: string };
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
    this.score ? this.hasNewHighScore() : null;
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.backAction);
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  backAction = () => {
    this.stateButton === "resume" 
      ? backOnlyOnce(this)
      : null;
    return true;
  }

  alertQuit = (cb: any, lastWords: string) => {
    Alert.alert("Hold on!", lastWords, [
      {
        text: "Cancel",
        onPress: () => null,
        style: "cancel"
      },
      { text: "YES", onPress: () => {
        cb();
      }}
    ]);
  }

  quit = () => {
    this.alertQuit(() => {
      this.alertQuit(() => BackHandler.exitApp(), "Seriously?")
    }, "Are you sure you want to quit?");
  }

  play = () => {
    const button = this.props.route.params?.button;
    (button === "resume")
      ? this.props.navigation.goBack() // resume
      : this.props.navigation.reset({ // restart
        index: 0,
        routes: [
          { name: 'FlappyBall', params: { button: button, connection: this.connection } },
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
        if (record && (this.score! > record)) {
          this.setState({ newHighScore: true });
          this.database
            .ref('users/' + this.user?.uid)
            .update({ record: this.score })
        }
      })
  }

  render() {
    return (
      <View style={{ ...styles.flexCenter, }}>
        <View style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          width: "90%",
          height: "90%",
          borderRadius: 10,
        }}>
          <View style={{ ...styles.flexCenter, }}>
            <View>
              {
                this.stateButton === "restart"
                  ? <View style={{ alignItems: "center" }}>
                      <Text style={styles.menuLabel}>That's Life</Text>
                      <Text style={{ ...styles.menuLabel, fontSize: 50 }}>{this.score}</Text>
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
                  onPress={this.play} />
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
  },
  flexCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

