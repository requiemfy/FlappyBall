import * as React from 'react';
import { 
  View,
  Text, 
  Button, 
  BackHandler, 
  Alert, 
  StyleSheet, 
  NativeEventSubscription, 
} from 'react-native';
import { NavigationParams } from 'react-navigation';
import { firebase } from '../../../src/firebase';
import { backOnlyOnce, safeSetState } from '../../../src/helpers';
import * as Cache from '../../../src/cache';
import NetInfo from '@react-native-community/netinfo';

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
type State = { 
  newHighScore: boolean; 
  earnedGold: string | number;
  // network: boolean; @remind
}

export default class MenuScreen extends React.PureComponent<Props, State> {
  database = firebase.database();
  user = firebase.auth().currentUser;
  dbUser = this.database.ref('users/' + this.user?.uid);
  // score = this.props.route.params?.score;
  score = 1;
  stateButton = this.props.route.params.button;
  connection = this.props.route.params.connection;
  backHandler!: NativeEventSubscription;
  // netInfo!: NetInfoSubscription; @remind
  network = true;
  cacheData = Cache.user.data!;
  mounted = true;
  safeSetState: any = safeSetState(this);

  constructor(props: Props) {
    super(props);
    this.state = {
      newHighScore: false,
      earnedGold: "Calculating",
      // network: true, @remind
    }
  }

  componentDidMount() {
    console.log("MENU SCREEN DID MOUNT");
    NetInfo.fetch().then(status => {
      this.network = Boolean(status.isConnected && status.isInternetReachable);
      this.isOnline();
    })
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.backAction);
    // this.netInfo = NetInfo.addEventListener(state => { @remind
    //   this.safeSetState({ network: Boolean(state.isConnected && state.isInternetReachable), networkChecked: true });
    // });
  }

  componentWillUnmount() {
    console.log("== menu: UN-MOUNT");
    this.mounted = false;
    this.safeSetState = () => null;
    this.backHandler.remove();
    // this.netInfo(); @remind
    this.dbUser.off();
  }

  private isOnline = () => {
    if (this.user && (this.stateButton === "restart")) {
      console.log("== menu: Online GAME OVER, score", this.score);
      if(this.score) this.checkScore()
      else if (this.score === 0) this.safeSetState({ earnedGold: 0 })
    } else {
      console.log("== menu: Just opening menu OR offline game over")
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

  private updateUserData = (val: {newScore?: number, gold: number}) => {
    const update = (() => {
      if (val.newScore) return { record: val.newScore, gold: val.gold }
      else return { gold: val.gold }
    })();

    console.log("== menu: checking network to record data", this.network);
    // if (!this.state.network) { @remind
    if (!this.network) {
      console.log("== menu: No internet, can't record data");
      this.unsavedData(update);
      this.alert("NO INTERNET", "Connect to internet to save your data");
      return;
    };

    console.log("== menu: Connected to internet, recording data...")
    this.dbUser.update(update)
      .then(_ => {
        Cache.user.update(update);
        console.log("== menu: finished updating user data in firebase")
      })
      .catch(err => {
        console.log("== menu: Error saving data", err)
        this.unsavedData(update);
        this.alert("Processing Error", "Something went wrong");
      });
  }

  private unsavedData = (update: any) => {
    console.log("== menu: trying to cache unsaved data...");
    Cache.user.storage.getItem('unsaved').then(resolve => {
      let unsaved: any = {};
      console.log("== menu: current unsaved data resolve", resolve);
      if(resolve) {
        unsaved = JSON.parse(resolve);
        let 
          userTmp: { record?: number, gold: number } = unsaved[this.user?.uid!],
          earnGold = userTmp?.gold ? userTmp.gold + (this.state.earnedGold as number) : update.gold;
        unsaved[this.user?.uid!] = update?.record ? { record: update.record, gold: earnGold } : { gold: earnGold };
        console.log("== menu: current user unsaved data if any", userTmp);
      } else {
        unsaved[this.user?.uid!] = update;
        console.log("== menu: no current unsaved data");
      }
      console.log("== menu: Caching user unsaved data", unsaved)
      Cache.user.pending.setItem('unsaved', JSON.stringify(unsaved))
          .then(_ => console.log("== menu: Success caching unsaved data"))
    }).catch(err => console.log("== menu: Error caching unsaved data"))
  }

  goldByNewRecord = (currentGold:number, currentRecord: number) => {
    let highScoreBonus = (currentRecord + 1) * 3, streakBonus = 0, earnedGold = 0;
    if ((this.score! - (currentRecord + 1)) !== 0) {
      streakBonus = this.score! * 4;
    }
    earnedGold = highScoreBonus + streakBonus;
    this.safeSetState({ earnedGold: earnedGold });
    this.updateUserData({ newScore: this.score, gold: earnedGold + currentGold });
  }

  checkScore = () => {
    // console.log("== menu: fetching firebase high score");
    // this.dbUser
    //   .once('value')
    //   .then(snapshot => {
    //     console.log("== menu: succeed fetching firebase high score, check if beaten...");
    //     const 
    //       userData = snapshot.val(),
    //       record = userData.record as number,
    //       currentGold = userData.gold as number;
    //     if ((record !== null) && (this.score! > record)) {
    //       console.log("== menu: HAS new high score", this.score);
    //       this.safeSetState({ newHighScore: true });
    //       this.goldByNewRecord(currentGold, record)
        // } else {
        //   console.log("== menu: NO new high score", this.score);
        //   const earnedGold = this.score! * 2;
        //   this.safeSetState({ earnedGold: earnedGold });
        //   this.updateUserData({ gold: currentGold + earnedGold })
        // }
    //   })
    //   .catch(err => console.log("High Score Error 1:", err));

    console.log("== menu: comparing score vs record");
    if(this.score! > this.cacheData.record) {
      console.log("== menu: HAS new high score", this.score);
      this.safeSetState({ newHighScore: true });
      this.goldByNewRecord(this.cacheData.gold, this.cacheData.record);
    } else {
      console.log("== menu: NO new high score", this.score);
      const earnedGold = this.score! * 2;
      this.safeSetState({ earnedGold: earnedGold });
      this.updateUserData({ gold: this.cacheData.gold + earnedGold })
    }
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

  private alert = (one: string, two: string) => {
    Alert.alert(one, two, [
      { 
        text: "OK", onPress: () => null
      }
    ]);
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
                      { this.showUserAchievement() }
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

