import * as React from 'react';
import { 
  View,
  Text, 
  Button, 
  BackHandler, 
  StyleSheet, 
  NativeEventSubscription,
  Dimensions, 
} from 'react-native';
import { NavigationParams } from 'react-navigation';
import { firebase } from '../../../src/firebase';
import { alert, alertQuit, backOnlyOnce, safeSetState } from '../../../src/helpers';
import * as Cache from '../../../src/cache';
import NetInfo from '@react-native-community/netinfo';
import { Orientation } from '../../Game/src/utils/helpers/events/Orientation';

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
}

export default class MenuScreen extends React.PureComponent<Props, State> {
  database = firebase.database();
  user = firebase.auth().currentUser;
  dbUser = this.database.ref('users/' + this.user?.uid);
  score = this.props.route.params?.score;
  stateButton = this.props.route.params.button;
  connection = this.props.route.params.connection;
  backHandler!: NativeEventSubscription;
  network = true;
  cacheData = Cache.user.data!;
  mounted = true;
  noMoreButtons = false;
  safeSetState: any = safeSetState(this);

  constructor(props: Props) {
    super(props);
    this.state = {
      newHighScore: false,
      earnedGold: "Calculating",
    }
  }

  componentDidMount() {
    console.log("MENU SCREEN DID MOUNT");
    NetInfo.fetch().then(status => {
      this.network = Boolean(status.isConnected && status.isInternetReachable);
      this.isOnline();
    });
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.backAction);
  }

  componentWillUnmount() {
    console.log("== menu: UN-MOUNT");
    this.mounted = false;
    this.safeSetState = () => null;
    this.backHandler.remove();
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

  quit = () => {
    if (this.noMoreButtons) return;
    this.noMoreButtons = true;
    alertQuit(() => {
      alertQuit(() => BackHandler.exitApp(), "Seriously?", () => this.noMoreButtons = false) // 3rd callback when cancelled
    }, "Are you sure you want to quit?", () => this.noMoreButtons = false);
  }

  play = () => {
    if (this.noMoreButtons) return;
    this.noMoreButtons = true;
    const button = this.props.route.params?.button;

    // Orientation.disableRotate(Dimensions.get('window')); // @remind
    // (button === "resume")
    //   ? this.props.navigation.goBack() // resume
    //   : this.props.navigation.reset({ // restart
    //     index: 0,
    //     routes: [
    //       { name: 'FlappyBall', params: { button: button, connection: this.connection } },
    //     ],
    //   });
    if (button === "resume") this.props.navigation.goBack();
    else {
      Orientation.disableRotate(Dimensions.get('window'));
      this.props.navigation.reset({ // restart
        index: 0,
        routes: [
          { name: 'FlappyBall', params: { button: button, connection: this.connection } },
        ],
      });
    }
  }

  goHome = () => {
    if (this.noMoreButtons) return;
    this.noMoreButtons = true;
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
    if (this.noMoreButtons) return;
    this.noMoreButtons = true;
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
    if (!this.network) {
      console.log("== menu: No internet, can't record data");
      this.unsavedData(update);
      alert("NO INTERNET", "Connect to internet to save your data");
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
        alert("Processing Error", "Something went wrong");
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
      Cache.user.pending.update(unsaved)
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
      console.log("== menu: ONLINE PLAY, score & gold")
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
      <View style={[styles.flexCenter]}>
        <View style={styles.container1}>
          <View style={[styles.flexCenter]}>
            <View>
              {
                this.stateButton === "restart"
                  ? <View style={{ alignItems: "center" }}>
                      <Text style={styles.menuLabel}>That's Life</Text>
                      <Text style={[{fontSize: 50}, styles.menuLabel]}>{this.score}</Text>
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
  container1: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: "90%",
    height: "90%",
    borderRadius: 10,
  },
})

