import * as React from 'react';
import { 
  Button, 
  StyleSheet, 
  View, 
  Text,
  NativeEventSubscription, 
  BackHandler 
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

interface Props { navigation: NavigationScreenProp<NavigationState, NavigationParams> & typeof CommonActions; }
interface State { 
  invalidCreds: boolean; 
  error: string;
  showConnectionState: boolean;
  connectState: string;
}

class LoginScreen extends React.PureComponent<NavigationInjectedProps & Props, State> {
  email = "";
  password = "";
  connection = { 
    current: true, 
    color: "green", 
  };
  navigation = this.props.navigation;
  authSubscriber!: firebase.Unsubscribe;
  netInfo!: NetInfoSubscription ;
  backHandler!: NativeEventSubscription;

  constructor(props: Props | any) {
    super(props);
    this.state = { 
      invalidCreds: false, 
      error: "Invalid Credentials",
      showConnectionState: false,
      connectState: "Checking connection...",
    };
  }

  componentDidMount() { // @note 3 subscription
    this.netInfo = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        if (!this.connection.current) {
          this.connection.current = true;
          this.setState({ 
            showConnectionState: true,
            connectState: "You are now connected to " + state.type
          });
          setTimeout(() => this.setState({ showConnectionState: false }), 2000);
        }
      } else {
        this.connection.current = false;
        this.setState({ 
          showConnectionState: true,
          connectState: "No internet connection"
        });
      }
    });
    this.authSubscriber = firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
      if (user && this.connection.current) {
        this.goLogin();
      } 
    });
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.backAction);
  }

  componentWillUnmount() {
    this.authSubscriber() // unsubscribe method returned
    this.backHandler.remove();
    this.netInfo();
  }

  backAction = () => {
    BackHandler.exitApp();
    return true;
  }

  tryLogin = () => {
    firebase
      .auth()
      .signInWithEmailAndPassword(this.email, this.password)
      .then((arg) => null)
      .catch((err: object) => {
        const error = String(err).replace('Error: ', '');
        this.setState({ invalidCreds: true, error: error });
      });
  }

  goLogin = () => {
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
            backgroundColor: this.connection.current ? "green" : "red",
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
          <Button
            onPress={this.tryLogin}
            title="Log In"
            color='rgba(66, 66, 66, 0.6)' />
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