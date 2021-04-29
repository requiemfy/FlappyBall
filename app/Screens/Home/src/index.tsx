import * as React from 'react';
import { 
  View, 
  Text, 
  Button, 
  BackHandler, Alert,
  ImageBackground, 
  StyleSheet
} from 'react-native';
import { NavigationParams } from 'react-navigation';
import { PulseIndicator } from 'react-native-indicators';
import { firebase } from '../../../src/firebase'
import * as Cache from '../../../src/cacheAssets'
import CacheStorage from 'react-native-cache-storage';

type HomeButton = keyof { play: string; resume: string; restart: string };
type HomeProps = { navigation: NavigationParams; route: { params: { button: HomeButton; } } }
type HomeState = { 
  loadingBG: boolean;
  user: { 
    loading: boolean; 
    error: boolean; 
    codeName: string; 
    record: number;
  }; 
}

// const cache = new CacheStorage(); @remind
// let userGold: number;
// let userData: {codeName: string, record: number, inventory: string[], gold: number};

export default class HomeScreen extends React.PureComponent<HomeProps, HomeState> {
  // user = firebase.auth().currentUser; @remind
  // db = firebase.database();
  mounted = true;

  constructor(props: HomeProps) {
    super(props);
    this.state = { 
      loadingBG: true, 
      user: {
        loading: true,
        error: true,
        codeName: "",
        record: 0,
      } 
    }

    // Cache.loadUserAssetAsync();@remind
    this.getUserData();
  }

  componentDidMount() {
    console.log("Home MOUNT");
  }

  componentWillUnmount() {
    console.log("== home: UN-MOUNT");
  }

  private safeSetState = (update: any) => {
    if (this.mounted) this.setState(update);
  }

  // private fetchUser = () => {@remind
    // this.db.ref('users/' + this.user?.uid)
    //   .once('value')
    //   .then(snapshot => {
    //     userData = snapshot.val();

    //     // this.safeSetState({ user: {
    //     //   loading: false,
    //     //   error: false,
    //     //   codeName: userData.codeName, 
    //     //   record: userData.record,
    //     // }});
    //     this.setStateUserData(userData);

    //     cache.setItem('current-user', JSON.stringify({userData}), 0);
    //     // userGold = user.gold; @remind clear

    //     Cache.loadUserAssetAsync();
    //     console.log("== home: success fetching user data, done caching");
    //   })
    //   .catch(err => {
    //     this.safeSetState({
    //       user: {
    //         ...this.state.user, 
    //         loading: false, 
    //         error: true
    //       }
    //     });
    //     console.log("== home: failed fetching user data");
    //   });
  // }

  // private getUserData = () => {
  //   console.log('== home: checking if let variable userData has value');
  //   if (userData) {
  //     console.log("== home: userData has value, use it instead (of cache)");
  //     this.setStateUserData(userData); // @note set state user
  //     return;
  //   } else {
  //     console.log("== home: NO value userData, try to use cache")
  //   }
  //   console.log('== home: checking if user data has cache');
  //   cache.getItem('current-user').then(arg => {
  //     if (arg) {
  //       console.log('== home: has cache of user data, retreived');
  //       // ======= @note this is combination =======
  //       userData = JSON.parse(arg);
        
        
  //       // this.safeSetState({ user: { @remind clear
  //       //   loading: false,
  //       //   error: false,
  //       //   codeName: userData.codeName,
  //       //   record: userData.record,
  //       // }});

  //       this.setStateUserData(userData);
  //       // ==========================================

  //       // userGold = userData.gold; @remind clear
  //     } else {
  //       console.log('== home: NO cache of user data, fetch it');
  //       this.fetchUser();
  //     }
  //   });
  // }

  private getUserData = () => {
    console.log("home: Getting user data...")
    new Promise((resolve, reject) => {
      Cache.loadUserAsync(resolve, reject);
    })
    .then(resolve => {
        console.log("== home: USER DATA RESOLVE", resolve);
        const user = resolve as {codeName: string, record: string};
        this.safeSetState({ user: {
          loading: false,
          error: false,
          codeName: user.codeName,
          record: user.record,
        }});
      })
    .catch(err => console.log("== home: USER DATA REJECT", err))
  }

  // private setStateUserData = (user: any) => { @remind
  //   this.safeSetState({ user: {
  //     loading: false,
  //     error: false,
  //     codeName: user.codeName,
  //     record: user.record,
  //   }});
  // }

  private alertQuit = (cb: any, lastWords: string) => {
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

  private quit = () => {
    this.alertQuit(() => {
      this.alertQuit(() => BackHandler.exitApp(), "Seriously?")
    }, "Are you sure you want to quit?");
  }

  private play = () => {
    this.props.navigation.reset({
      index: 0,
      routes: [
        { name: 'FlappyBall', params: { button: "play", connection: "online" } },
      ],
    });
  }

  private goSettings = () => {
    this.props.navigation.navigate('Settings');
  }

  private goHallOfFame = () => {
    this.props.navigation.navigate('HallOfFame');
  }

  render() {
    return (
      <View style={{ ...styles.flexCenter, }}>
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
          <View style={{ ...styles.flexCenter, }}>
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
            <View style={{ marginTop: 30, ...styles.flexCenter, }}>
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

// function getUserData() {
//   // return userGold; @remind clear
//   return userData;
// }

// function setCurrentGold(val: number) {
//   // userGold = val; @remind clear
//   userData.gold = val;
// }

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
  },
  flexCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
});


// export { getUserData, setCurrentGold, cache };@remind
