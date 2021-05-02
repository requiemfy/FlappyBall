import * as React from 'react';
import { 
  Alert, 
  Button, 
  StyleSheet, 
  View, 
  Text, 
  NativeEventSubscription, 
  BackHandler 
} from 'react-native';
import { 
  ScrollView, 
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
import { alert, alertQuit, backOnlyOnce, safeSetState } from '../../../src/helpers';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resetBallSprite } from '../../Inventory/src';
import * as Cache from '../../../src/cache'
import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo';

interface Props { navigation: NavigationScreenProp<NavigationState, NavigationParams> & typeof CommonActions; }
interface State { 
  invalidCreds: boolean; 
  error: string;
  currentPass: string;
  newPass: string;
  confirmPass: string; 
}

class SettingScreen extends React.PureComponent<NavigationInjectedProps & Props, State> {
  navigation = this.props.navigation;
  backHandler!: NativeEventSubscription;
  netInfo!: NetInfoSubscription ;
  mounted = true;
  network = true;
  safeSetState: any = safeSetState(this);

  constructor(props: Props | any) {
    super(props);
    this.state = { 
      invalidCreds: false, 
      error: "Invalid Inputs",
      currentPass: "",
      newPass: "",
      confirmPass: "",
    };
  }

  componentDidMount() {
    console.log("settings MOUNT");
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.backAction);
    this.netInfo = NetInfo.addEventListener(state => {
      this.network = Boolean(state.isConnected && state.isInternetReachable);
    });
  }

  componentWillUnmount() {
    console.log("settings UN-MOUNT")
    this.mounted = false;
    this.safeSetState = () => null;
    this.netInfo();
    this.backHandler.remove();
  }

  backAction = () => {
    backOnlyOnce(this);
    return true;
  }

  showError = (err: any) => {
    const error = String(err).replace('Error: ', '');
    this.safeSetState({ invalidCreds: true, error: error });
  }

  changePass = () => {
    if (!this.network) return alert("NO INTERNET", "Please connect to a network");
    if (this.state.newPass !== this.state.confirmPass) {
      this.safeSetState({ invalidCreds: true, error: "Password doesn't match." });
      return null;
    } else  if (this.state.newPass === this.state.currentPass || this.state.newPass === "") {
      this.safeSetState({ invalidCreds: true, error: "Please enter new password." });
      return null;
    }
    const 
      user = firebase.auth().currentUser,
      cred = firebase.auth.EmailAuthProvider.credential(user?.email!, this.state.currentPass);
    user?.reauthenticateWithCredential(cred)
      .then(() => {
        firebase.auth().currentUser?.updatePassword(this.state.newPass)
          .then(() => {
            Alert.alert("Password", "Successfully Changed", [
              { 
                text: "OK", 
                onPress: () => {
                  this.safeSetState({ currentPass: "", newPass: "", confirmPass: "" })
                } 
              }
            ]);
            this.safeSetState({ invalidCreds: false })
          })
          .catch(err => {
            this.showError(err)
          })
      })
      .catch(err => {
        this.showError(err)
      });
  }

  clearCache = () => {
    Cache.inventory.clear();
    Cache.shop.clear();
    Cache.user.clear();
  }

  logout = () => {
    alertQuit(() => {
      alertQuit(() => {
        firebase
          .auth()
          .signOut()
          .then(() => {
            resetBallSprite();
            this.clearCache();
            this.navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          })
          .catch(err => console.log(err));
      }, "Seriously?")
    }, "Are you sure you want to logout?")
  }

  goInventory = () => {
    this.navigation.navigate("Inventory");
  }

  goShop = () => {
    this.navigation.navigate("Shop");
  }

  render() {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View
            style={[styles.button, { height: 50 }]}>
            <Button
              onPress={this.goInventory}
              title='inventory'
              color='rgba(66, 66, 66, 0.6)' />
          </View>
          <View
            style={[styles.button, { height: 100 }]}>
            <Button
              onPress={this.goShop}
              title='shop'
              color='rgba(66, 66, 66, 0.6)' />
          </View>
          {
            this.state.invalidCreds &&
            <View style={styles.invalidCreds}>
              <Text style={{ color: "red", textAlign: "center" }}>{this.state.error}</Text>
            </View>
          }
          <Text style={styles.changePassLabel}>Change Password</Text>
          <TextInput
            onChangeText={(text => this.safeSetState({ currentPass: text }))}
            value={this.state.currentPass}
            placeholder="Current Password"
            placeholderTextColor="white"
            secureTextEntry={true}
            style={styles.textInput} />
          <TextInput
            onChangeText={(text => this.safeSetState({ newPass: text }))}
            value={this.state.newPass}
            placeholder="Password"
            placeholderTextColor="white"
            secureTextEntry={true}
            style={styles.textInput} />
          <TextInput
            onChangeText={(text => this.safeSetState({ confirmPass: text }))}
            value={this.state.confirmPass}
            placeholder="Confirm Password"
            placeholderTextColor="white"
            secureTextEntry={true}
            style={styles.textInput} />
          <View
            style={[styles.button]}>
            <Button
              onPress={this.changePass}
              title='CONFIRM'
              color='rgba(66, 66, 66, 0.6)' />
          </View>
          <View
            style={[{ width: 100, marginTop: 30 }]}>
            <Button
              onPress={this.logout}
              title='LOG OUT'
              color='rgba(66, 66, 66, 0.3)' />
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    padding: 10,
    flexGrow: 1,
    justifyContent: "center",
    alignItems: 'center',
    backgroundColor: "black",
  },
  changePassLabel: { 
    color: "white", 
    fontWeight: "bold", 
    fontSize: 20, 
    marginBottom: "2%" 
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
  button: {
    width: "80%",
    marginTop: 5,
  }
})
export default withNavigation(SettingScreen);