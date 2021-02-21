import * as React from 'react';
import { View, Text, Button, StatusBar, BackHandler, Alert, BackHandlerStatic, Dimensions, ImageBackground, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FlappyBallGame from '../../Game/src';
import { NavigationParams, } from 'react-navigation';
import { PulseIndicator } from 'react-native-indicators';
import { FlatList } from 'react-native-gesture-handler';

type HOFButton = keyof { play: string, resume: string, restart: string };
type Props = { navigation: NavigationParams; route: { params: { button: HOFButton, } } }
type State = { loading: boolean; feeds: [] }
type Feeds = {
  item: {
    name: string;
    profile: string;
    post: string;
    image: string;
  }
}

export default class HallOfFameScreen extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = { loading: true, feeds: [] };
  }

  componentDidMount() {
    console.log("HallOfFame SCREEN WILL MOUNT");

    fetch('https://raw.githubusercontent.com/loyd-larazo/app-dev-2020-finals/main/feeds.json')
      .then((response) => response.json())
      .then((json) => this.setState({ feeds: json }))
      .catch((error) => console.error(error))
      .finally(() => this.setState({ loading: false }));
  }

  componentWillUnmount() {
    console.log("HallOfFame SCREEN WILL UUUUUUUUUUUN-MOUNT");
  }


  back = () => {
    this.props.navigation.goBack()
  }

  render() {
    const button = this.props.route.params?.button;
    return (
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <View style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          width: "90%",
          height: "90%",
          borderRadius: 10,
        }}>
          <View style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}>
            <View style={{ flex: 1, justifyContent: "center", }}>
              <Text style={styles.HallOfFameLabel}>HALL OF FAME</Text>
            </View>
            

            <View style={{
              flex: 4,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {
              this.state.loading 
              ? <ActivityIndicator size="large" color="#00ff00" />
              : (<FlatList
                  data={this.state.feeds}
                  renderItem={({ item }: Feeds) => {
                    return (
                      <View style={{
                        alignItems: "center",
                        // margin: 10,
                        borderTopWidth: 1,
                        borderColor: "#e0e0e0",
                        backgroundColor: "black", 
                      }}>
                          {/* <Image 
                            style={styles.profilePicture}
                            source={{ uri: item.profile }}/> */}
                          <Text style={{ 
                            fontSize: 18, 
                            color: "white", 
                          }}>{item.name}</Text>
                          <Text style={{ 
                            fontSize: 20, 
                            color: "white", 
                            fontStyle: "italic",
                            fontWeight: "bold",
                          }}>10</Text>
                      </View>
                    );
                  }}
                  keyExtractor={(item, index) => index.toString()} />)
            }
            </View>  


            <View style={{ flex: 1, justifyContent: "center", }}>
              <View style={[styles.HOFButton]}>
                <Button
                  title="OK"
                  color="transparent"
                  onPress={this.back} />
              </View>
            </View>
          </View>
        </View>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  HallOfFameLabel: { fontSize: 20, fontWeight: "bold", color: "white" },
  HOFButton: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
  },

  profileContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "transparent", 
  },
  profilePicture: {
    width: 30,
    height: 30,
    margin: 10,
    borderRadius: 60,
    resizeMode: "contain",
  },
  postPicture: {
    width: 280,
    height: 280,
    margin: 15,
    resizeMode: "contain",
  },
})

