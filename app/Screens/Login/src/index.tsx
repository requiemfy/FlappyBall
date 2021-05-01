import * as React from 'react';
import { 
  Button, 
  StyleSheet, 
  View, 
  Text,
  NativeEventSubscription, 
  BackHandler, 
  ActivityIndicator
} from 'react-native';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { 
  NavigationScreenProp, 
  NavigationState, 
  NavigationInjectedProps, 
  withNavigation, 
  NavigationParams,
} from 'react-navigation';
import { CommonActions } from '@react-navigation/native';
import { firebase } from '../../../src/firebase'
import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo';
import { alert, safeSetState } from '../../../src/helpers';

interface Props { navigation: NavigationScreenProp<NavigationState, NavigationParams> & typeof CommonActions; }
interface State { 
  invalidCreds: boolean; 
  error: string;
  network: boolean;
  showConnectionState: boolean;
  connectState: string;
  loading: boolean;
}

class LoginScreen extends React.PureComponent<NavigationInjectedProps & Props, State> {
  email = "";
  password = "";
  // connection = true; @remind
  navigation = this.props.navigation;
  authSubscriber!: firebase.Unsubscribe;
  netInfo!: NetInfoSubscription ;
  backHandler!: NativeEventSubscription;
  mounted = true;
  safeSetState: any = safeSetState(this);

  constructor(props: Props | any) {
    super(props);
    this.state = { 
      invalidCreds: false, 
      error: "Invalid Credentials",
      network: true,
      showConnectionState: false,
      connectState: "Checking connection...",
      loading: false,
    };
  }

  componentDidMount() { // @note 3 subscription
    this.netInfo = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        if (!this.state.network) {
          // this.state.network = true; @remind
          this.safeSetState({ 
            network: true,
            showConnectionState: true,
            connectState: "You are now connected to " + state.type
          });
          setTimeout(() => this.safeSetState({ showConnectionState: false }), 2000);
        }
      } else {
        // this.state.network = false; @remind
        this.safeSetState({ 
          network: false,
          showConnectionState: true,
          connectState: "No internet connection"
        });
      }
    });
    this.authSubscriber = firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
      if (user && this.state.network) {
        this.goHome();
      } 
    });
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.backAction);
  }

  componentWillUnmount() {
    this.mounted = false;
    this.safeSetState = () => null;
    this.authSubscriber() // unsubscribe method returned
    this.backHandler.remove();
    this.netInfo();
  }

  backAction = () => {
    BackHandler.exitApp();
    return true;
  }

  tryLogin = () => {
    this.safeSetState({ loading: true });
    if (!this.state.network) {
      this.safeSetState({ loading: false });
      alert("NO INTERNET", "Please connect to internet")
      return;
    }
    firebase
      .auth()
      .signInWithEmailAndPassword(this.email, this.password)
      .catch((err: object) => {
        const error = String(err).replace('Error: ', '');
        this.safeSetState({ invalidCreds: true, error: error, loading: false });
      });
  }

  goHome = () => {
    this.navigation.reset({ 
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }

  signUp = () => {
    this.navigation.navigate('SignUp');
  }

  // @remind
  playOffline = () => {
    this.navigation.reset({ 
      index: 0,
      routes: [{ 
        name: 'FlappyBall',
        params: { connection: "offline" }
      }],
    }) 
  }

  render() {
    return(
      <View style={styles.rootContainer}>
        {
          this.state.showConnectionState &&
          <View style={{
            position: "absolute",
            backgroundColor: this.state.network ? "green" : "red",
            top: 0,
            width: "100%",
            height: "5%",
            justifyContent: "center"
          }}>
            <Text style={{ 
              color: "black", 
              textAlign: "center" 
            }}>{this.state.connectState}</Text>
          </View>
        }
        {
          this.state.invalidCreds && 
          <View style={styles.invalidCreds}>
            <Text style={{ color: "red" }}>Invalid Credentials</Text>
          </View>
        }
        <Text style={styles.title}>FLAPPY BALL</Text>
        <TextInput 
          onChangeText={(text => {this.email = text})}
          placeholder="Email"
          placeholderTextColor="white"
          style={styles.textInput} />
        <TextInput 
          onChangeText={(text => {this.password = text})}
          placeholder="Password"
          placeholderTextColor="white"
          secureTextEntry={true}
          style={styles.textInput} /> 
        <View 
          style={[{width:"80%", margin: 10}]}>
          {
            this.state.loading
              ? <ActivityIndicator size="small" color="white" />
              : <Button
                  onPress={this.tryLogin}
                  title="Log In"
                  color='rgba(66, 66, 66, 0.6)' />
          }
          
        </View> 
        <View style={styles.signUp}>
          <Text style={{ color: "#989898" }}>Don't have an account?</Text>
          <TouchableOpacity onPress={this.signUp}>
            <Text style={{ fontWeight: 'bold', color: 'white' }} >Sign Up</Text>
          </TouchableOpacity>
        </View>
        <View 
          style={[{width:"60%", margin: 10}]}>
          <Button
            onPress={this.playOffline}
            title="Play Offline"
            color='rgba(66, 66, 66, 0.6)' />
        </View> 
      </View>
    )
  }
}

const styles = StyleSheet.create({  
  loadingContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#f2f2f2",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rootContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: "black",
  },
  textInput: {
    width: "80%",
    height: 40,
    margin: 5,
    paddingLeft: 20,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "white"
  },
  signUp: { 
    width: "100%",
    height: "8%", 
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  invalidCreds: { 
    width: "100%", 
    height: "5%", 
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "pink", 
  },
  title: { 
    fontSize: 30, 
    fontWeight: "bold", 
    color: "white" ,
    marginBottom: 20,
  }
})
export default withNavigation(LoginScreen);