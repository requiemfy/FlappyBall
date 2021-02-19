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
interface State { invalidCreds: boolean;}

class SettingScreen extends React.PureComponent<NavigationInjectedProps & Props, State> {
  oldPass = "";
  password = "";
  confirmPass = "";
  navigation = this.props.navigation;

  constructor(props: Props | any) {
    super(props);
    this.state = { invalidCreds: false, };
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
            <Text style={{ color: "red" }}>Invalid Credentials</Text>
          </View>
        }
        <TextInput
          onChangeText={(text => { this.password = text })}
          placeholder="Old Password"
          placeholderTextColor="white"
          secureTextEntry={true}
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