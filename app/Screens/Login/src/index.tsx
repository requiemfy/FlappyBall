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

interface Props { navigation: NavigationScreenProp<NavigationState, NavigationParams> & typeof CommonActions; }
interface State { invalidCreds: boolean; loading: boolean}

class LoginScreen extends React.PureComponent<NavigationInjectedProps & Props, State> {
  email: string;
  password: string;
  navigation: Props["navigation"];

  constructor(props: Props | any) {
    super(props);
    this.email = "";
    this.password = "";
    this.state = { invalidCreds: false, loading: true };
    this.navigation = this.props.navigation;
  }

  componentWillUnmount() {console.log("LOGIN SCREEN UNMOUNTED");}
  componentDidMount() {console.log("LOGIN SCREEN UNMOUNTED");}

  tryLogin = () => {
    const isValid = this.email === "jasonramirez@gmail.com" && this.password === "1234";
    if (isValid) {
      this.setState({ invalidCreds: false });
      this.navigation.reset({ 
        index: 0,
        routes: [{ name: 'Menu' }],
      });
    } 
    else this.setState({ invalidCreds: true });
  }

  signUpAlert = () => {
    this.navigation.navigate('SignUp');
  }

  render() {
    return(
      <View style={styles.rootContainer}>
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
          <TouchableOpacity onPress={this.signUpAlert}>
            <Text style={{ fontWeight: 'bold', color: 'white' }} >Sign Up</Text>
          </TouchableOpacity>
        </View>
        {
          // this.state.loading 
          false
            && (<View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#00ff00"/>
                </View>)
        }
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
    // position: "absolute",
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
    marginBottom: "10%"
  }
})
export default withNavigation(LoginScreen);