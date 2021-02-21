import * as React from 'react';
import { View, Text, Button, StatusBar, BackHandler, Alert, BackHandlerStatic, Dimensions, ImageBackground, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FlappyBallGame from '../../Game/src';
import { NavigationParams, } from 'react-navigation';
import { PulseIndicator } from 'react-native-indicators';
import { FlatList } from 'react-native-gesture-handler';
import { firebase } from '../../../src/firebase'

type HOFButton = keyof { play: string, resume: string, restart: string };
type Players = { [key: string]: { codeName: string, record: 0 } }
type Props = { navigation: NavigationParams; route: { params: { button: HOFButton, } } }
type State = { loading: boolean; players: string[] }

export default class HallOfFameScreen extends React.PureComponent<Props, State> {
  records: any

  constructor(props: Props) {
    super(props);
    this.state = { loading: true, players: [] };
  }

  componentDidMount() {
    console.log("HallOfFame SCREEN WILL MOUNT");
    firebase
      .database()
      .ref('/users')
      .once('value')
      .then(snapshot => {
        this.records = snapshot.val();
        const arr = Object.keys(this.records).sort((a,b) => this.records[b].record - this.records[a].record);
        this.setState({ players: arr, loading: false });
      })
      .catch(err => console.log(err))
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
          backgroundColor: 'rgba(0,0,0,0.9)',
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
              ? <ActivityIndicator size="large" color="white" />
              : (<FlatList
                  data={this.state.players}
                  renderItem={({ item }) => {
                    return (
                      <View style={{
                        alignItems: "center",
                        borderTopWidth: 1,
                        borderColor: "#e0e0e0",
                        backgroundColor: "black", 
                        paddingTop: 10,
                        paddingBottom: 10,
                        width: 200
                      }}>
                        <Text style={{ 
                          fontSize: 18, 
                          color: "white", 
                        }}>{this.records[item].codeName}</Text>
                        <Text style={{ 
                          fontSize: 20, 
                          color: "white", 
                          fontStyle: "italic",
                          fontWeight: "bold",
                        }}>{this.records[item].record}</Text>
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
})

