import * as React from 'react';
import { 
  View,
  Text, 
  Button, 
  BackHandler, 
  Alert, 
  StyleSheet, 
  NativeEventSubscription 
} from 'react-native';
import { NavigationParams } from 'react-navigation';
import { firebase } from '../../../src/firebase';
import { backOnlyOnce } from '../../../src/helpers';
import * as Cache from '../../../src/cacheAssets';

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
type State = { newHighScore: boolean, earnedGold: string | number}

export default class MenuScreen extends React.PureComponent<Props, State> {
  database = firebase.database();
  user = firebase.auth().currentUser;
  score = this.props.route.params?.score;
  stateButton = this.props.route.params.button;
  connection = this.props.route.params.connection;
  backHandler!: NativeEventSubscription;
  dbUser = this.database.ref('users/' + this.user?.uid);
  mounted = true;

  constructor(props: Props) {
    super(props);
    this.state = {
      newHighScore: false,
      earnedGold: "Calculating",
    }
  }

  componentDidMount() {
    console.log("MENU SCREEN WILL MOUNT");
    this.isGameOver();
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.backAction);
  }

  componentWillUnmount() {
    console.log("MENU SCREEN WILL UUUUUUUUUUUN-MOUNT");
    this.backHandler.remove();
    this.mounted = false;
    this.dbUser.off();
  }

  private safeSetState = (update: any) => {
    if (this.mounted) this.setState(update);
  }

  private isGameOver = () => {
    // if(this.user) this.score ? this.checkScore() : this.setState({ earnedGold: 0 }); @remind
    if (this.user && (this.stateButton === "restart")) {
      console.log("== menu: GAME OVER user has score", this.score);
      // this.score ? this.checkScore() : this.setState({ earnedGold: 0 }); @remind
      if(this.score) this.checkScore()
      else if (this.score === 0) this.setState({ earnedGold: 0 })
    } else {
      console.log("== menu: just opening menu")
    }
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

  // earnGold = (amount: number) => {
  //   this.dbUser.update({ gold: amount })
  //     .then(_ => Cache.user.update({ gold: amount }))
  //     .catch(err => console.log("Earn Gold Error 1:", err)); @remind
  // }

  // updateHighScore = () => {
    // this.dbUser.update({ record: this.score })
    //   .then(_ => Cache.user.update({ record: this.score }))
    //   .catch(err => console.log("High Score Error 2:", err));
  // }

  updateUserData = (val: {newScore?: number, gold: number}) => {
    console.log("== menu: trying to update user data in firebase")
    const update = (() => {
      if (val.newScore) return { record: val.newScore, gold: val.gold }
      else return { gold: val.gold }
    })();
    this.dbUser.update(update)
      .then(_ => {
        Cache.user.update(update);
        console.log("== menu: finished updating user data in firebase")
      })
      .catch(err => console.log("High Score Error 2:", err));
  }

  goldByNewRecord = (currentGold:number, currentRecord: number) => {
    let highScoreBonus = (currentRecord + 1) * 3, streakBonus = 0, earnedGold = 0;
    if ((this.score! - (currentRecord + 1)) !== 0) {
      streakBonus = this.score! * 4;
    }
    earnedGold = highScoreBonus + streakBonus;
    this.safeSetState({ earnedGold: earnedGold });
    // this.earnGold(earnedGold + currentGold); @remind
    this.updateUserData({ newScore: this.score, gold: earnedGold + currentGold });

  }

  checkScore = () => {
    console.log("== menu: fetching firebase high score");
    this.dbUser
      .once('value')
      .then(snapshot => {
        console.log("== menu: succeed fetching firebase high score, check if beaten...");
        const 
          userData = snapshot.val(),
          record = userData.record as number,
          currentGold = userData.gold as number;
        if ((record !== null) && (this.score! > record)) {
          console.log("== menu: HAS new high score", this.score);
          this.safeSetState({ newHighScore: true });
          // this.updateHighScore(); @remind
          this.goldByNewRecord(currentGold, record)
        } else {
          console.log("== menu: NO new high score", this.score);
          const earnedGold = this.score! * 2;
          this.safeSetState({ earnedGold: earnedGold });
          // this.earnGold(currentGold + (earnedGold)); @remind
          this.updateUserData({ gold: currentGold + earnedGold })
        }
      })
      .catch(err => console.log("High Score Error 1:", err));
  }

  private showUserAchievement = () => {
    if (this.user) {
      console.log("== menu: ONLINE PLAY, show high score & gold")
      return (
        <>
          {
            this.state.newHighScore
            ? <Text style={{...styles.menuLabel, fontSize: 15}}>Oh it's a NEW HIGH SCORE!!</Text>
            : null
          }
          <Text style={{ fontWeight: "bold", color: "yellow", fontSize: 12 }}>{this.state.earnedGold} Gold</Text>
        </>
      )
    } else {
      console.log("== menu: OFFLINE PLAY, only score shown");
      return null
    };
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
                        // this.state.newHighScore
                        //   ? <Text style={{...styles.menuLabel, fontSize: 15}}>Oh it's a NEW HIGH SCORE!!</Text>
                        //   : null
                        // this.user 
                        // ? <Text style={{ fontWeight: "bold", color: "yellow", fontSize: 12 }}>{this.state.earnedGold} Gold</Text>
                        // : null
                        // this.user
                        // ? this.newHighScoreComp()
                        this.showUserAchievement()
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

