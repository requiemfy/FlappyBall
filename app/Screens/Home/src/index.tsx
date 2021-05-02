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
import * as Cache from '../../../src/cache'
import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo';
import { safeSetState } from '../../../src/helpers';

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
  network: boolean;
  showConnectionState: boolean;
  connectState: string;
}

export default class HomeScreen extends React.PureComponent<HomeProps, HomeState> {
  netInfo!: NetInfoSubscription;
  mounted = true;
  safeSetState: any = safeSetState(this);

  constructor(props: HomeProps) {
    super(props);
    this.state = { 
      loadingBG: true, 
      user: {
        loading: true,
        error: true,
        codeName: "",
        record: 0,
      },
      network: true,
      showConnectionState: false,
      connectState: "Checking connection...",
    }
    this.getUserData();
  }

  componentDidMount() {
    console.log("Home MOUNT");
    this.netInfo = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        if (!this.state.network) {
          this.safeSetState({ 
            network: true,
            showConnectionState: true,
            connectState: "You are now connected to " + state.type
          });
          setTimeout(() => this.safeSetState({ showConnectionState: false }), 2000);
        }
      } else {
        this.safeSetState({ 
          network: false,
          showConnectionState: true,
          connectState: "No internet connection"
        });
      }
    });
  }

  componentWillUnmount() {
    console.log("== home: UN-MOUNT");
    this.mounted = false;
    this.safeSetState = () => null;
    this.netInfo();
  }

  private getUserData = () => {
    console.log("home: Getting user data...")
    new Promise((resolve, reject) => {
      Cache.loadUserAsync(resolve, reject);
    })
    .then(resolve => {
        console.log("== home: USER DATA RESOLVE", resolve);
        if (!resolve) return;
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
      <View style={styles.flexCenter}>
        {
          this.state.showConnectionState &&
          <View style={[styles.network1, {backgroundColor: this.state.network ? "green" : "red",}]}>
            <Text style={styles.network2}>{this.state.connectState}</Text>
          </View>
        }
        <View style={styles.container1}>
          <ImageBackground 
            source={require('../assets/bg.png')}
            style={styles.bg}
            onLoadEnd={() => this.safeSetState({ loadingBG: false })}>
          </ImageBackground>
          <View style={{ ...styles.flexCenter, }}>
            <View style={{ flex: 1, justifyContent: "center", }}>
              <Text style={styles.flappyball}>FLAPPY BALL</Text>
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
            ? <View style={styles.loading}>
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
  },
  flexCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container1: {
    backgroundColor: "black",
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  bg: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  flappyball: { 
    fontSize: 40, 
    fontWeight: "bold", 
    color: "white" 
  },
  network1: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "5%",
    justifyContent: "center",
    zIndex: 9999
  },
  network2: { 
    color: "black", 
    textAlign: "center" 
  },
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "black",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});