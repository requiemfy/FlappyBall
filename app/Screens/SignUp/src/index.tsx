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
import { 
  TextInput, 
} from 'react-native-gesture-handler';
import {
  NavigationScreenProp,
  NavigationState,
  NavigationInjectedProps,
  withNavigation,
  NavigationParams,
} from 'react-navigation';
import { CommonActions } from '@react-navigation/native';
import { firebase } from '../../../src/firebase'
import { alert, backOnlyOnce, safeSetState } from '../../../src/helpers';
import NetInfo from '@react-native-community/netinfo';

interface Props { navigation: NavigationScreenProp<NavigationState, NavigationParams> & typeof CommonActions; }
interface State { 
  invalidCreds: boolean; 
  error: string;
  loading: boolean;
}

class SignUpScreen extends React.PureComponent<NavigationInjectedProps & Props, State> {
  db = firebase.database();
  dbUsers = this.db.ref('users');
  email = "";
  codeName = "";
  password = "";
  confirmPass = "";
  navigation = this.props.navigation;
  backHandler!: NativeEventSubscription;
  lockButtons = false;
  mounted = true;
  safeSetState:any = safeSetState(this);

  constructor(props: Props | any) {
    super(props);
    this.state = { 
      invalidCreds: false, 
      error: "Invalid Credentials",
      loading: false,
    };
  }

  componentDidMount() {
    console.log("Signup: MOUNT");
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.backAction);
  }

  componentWillUnmount() {
    console.log("== signup: UN-MOUNT")
    this.mounted = false;
    this.safeSetState = () => null;
    this.dbUsers.off();
    this.backHandler.remove();
  }

  private unlockButtons = () => this.lockButtons = false;

  backAction = () => {
    backOnlyOnce(this);
    return true;
  }

  trySignUp = () => {
    if (this.lockButtons) return;
    NetInfo.fetch().then(status => {
      const network = Boolean(status.isConnected && status.isInternetReachable);
      if (!network) {
        this.lockButtons = true;
        return alert("NO INTERNET", "Please connect to internet", this.unlockButtons);
      }
      if (this.password !== this.confirmPass) {
        this.safeSetState({ invalidCreds: true, error: "Password doesn't match." });
        return;
      }
      this.safeSetState({ loading: true });
      console.log("== signup: Try sign up")
      this.dbUsers.orderByChild("codeName").equalTo(this.codeName).once("value")
        .then(snapshot => {
          if (!snapshot.exists() && this.codeName !== "" && !this.codeName.includes(" ")) {// if null then unique
            // these verfy email and password length
            firebase
              .auth()
              .createUserWithEmailAndPassword(this.email, this.password)
              .then((arg) => {
                // add user initial data to database
                this.safeSetState({ invalidCreds: false });
                const user = {
                  codeName: this.codeName,
                  record: 0,
                  gold: 1000,
                };
                this.db.ref('users/' + arg.user?.uid)
                  .update(user)
                  .then(snapshot => {
                    console.log("== signup: Success", snapshot);
                  })
                  .catch(err => {
                    console.log("== signup: Failed", err);
                  })
                  .finally(() => this.safeSetState({ loading: false }));
              })
              .catch((err: object) => {
                const error = String(err).replace('Error: ', '');
                this.safeSetState({ invalidCreds: true, error: error, loading: false });
            });
          } else {
            this.safeSetState({ invalidCreds: true, error: "Code Name is already used or has space.", loading: false });
          }
        })
        .catch(err => {
          console.log(err);
          this.safeSetState({ loading: false });
        });
    });
  }

  render() {
    return (
      <View style={styles.rootContainer}>
        {
          this.state.invalidCreds &&
          <View style={styles.invalidCreds}>
            <Text style={{ color: "red", textAlign: "center" }}>{this.state.error}</Text>
          </View>
        }
        <TextInput
          onChangeText={(text => { this.email = text })}
          placeholder="Email"
          placeholderTextColor="white"
          style={styles.textInput} />
        <TextInput
          onChangeText={(text => { this.codeName = text })}
          placeholder="Code Name"
          placeholderTextColor="white"
          style={styles.textInput} />
        <TextInput
          onChangeText={(text => { this.password = text })}
          placeholder="Password"
          placeholderTextColor="white"
          secureTextEntry={true}
          style={styles.textInput} />
        <TextInput
          onChangeText={(text => { this.confirmPass = text })}
          placeholder="Confirm Password"
          placeholderTextColor="white"
          secureTextEntry={true}
          style={styles.textInput} />
          <View style={[styles.signUpButton]}>
            { 
              this.state.loading
              ? <ActivityIndicator size="small" color="white" />
              : <Button
                    onPress={this.trySignUp}
                    title='Sign Up'
                    color='rgba(66, 66, 66, 0.6)' />
            }
          </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
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
    color: 'white',
  },
  invalidCreds: {
    width: "100%",
    height: "5%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "pink",
  },
  signUpButton: {
    width: "80%",
    marginTop: 5,
  }
})
export default withNavigation(SignUpScreen);