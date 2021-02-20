import * as React from 'react';
import { Alert, Button, Image, StyleSheet, View, ActivityIndicator, Platform, Dimensions, Text } from 'react-native';
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

interface Props { navigation: NavigationScreenProp<NavigationState, NavigationParams> & typeof CommonActions; }
interface State { invalidCreds: boolean; error: string }

class SettingScreen extends React.PureComponent<NavigationInjectedProps & Props, any> {
  navigation = this.props.navigation;

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
  }

  componentWillUnmount() {
    console.log("settings UN-MOUNT")
  }

  changePass = () => {
    // if (true) {
      // this.setState({ invalidCreds: false });
      // this.navigation.reset({
      //   index: 0,
      //   routes: [{ name: 'Menu' }],
      // });
    // }
    // else this.setState({ invalidCreds: true });

    if (this.state.newPass !== this.state.confirmPass) {
      this.setState({ invalidCreds: true, error: "Password doesn't match." });
      return null;
    } else  if (this.state.newPass === this.state.currentPass || this.state.newPass === "") {
      this.setState({ invalidCreds: true, error: "Please enter new password." });
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
                  this.setState({ currentPass: "", newPass: "", confirmPass: "" })
                } 
              }
            ]);
            this.setState({ invalidCreds: false })
          })
          .catch(err => {
            Alert.alert("Password", err, [
              { text: "OK", onPress: () => null }
            ]);
          })
      })
      .catch(err => {
        console.log("ggwp", err)
        const error = String(err).replace('Error: ', '');
        this.setState({ invalidCreds: true, error: error });
      });

  }

  logout = () => {
    this.setState({ invalidCreds: false });
    firebase
      .auth()
      .signOut()
      .then(() => this.navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        }))
      .catch(err => console.log(err));
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
        <Text style={styles.changePassLabel}>Change Password</Text>
        <TextInput
          onChangeText={(text => this.setState({ currentPass: text }))}
          value={this.state.currentPass}
          placeholder="Current Password"
          placeholderTextColor="white"
          secureTextEntry={true}
          style={styles.textInput} />
        <TextInput
          onChangeText={(text => this.setState({ newPass: text }))}
          value={this.state.newPass}
          placeholder="Password"
          placeholderTextColor="white"
          secureTextEntry={true}
          style={styles.textInput} />
        <TextInput
          onChangeText={(text => this.setState({ confirmPass: text }))}
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
          style={[styles.button, { marginTop: "10%" }]}>
          <Button
            onPress={this.logout}
            title='LOG OUT'
            color='rgba(66, 66, 66, 0.6)' />
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