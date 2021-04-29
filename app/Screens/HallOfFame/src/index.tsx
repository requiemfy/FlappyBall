import * as React from 'react';
import { 
  View, 
  Text, 
  Button, 
  BackHandler, 
  StyleSheet, 
  ActivityIndicator, 
  NativeEventSubscription 
} from 'react-native';
import { NavigationParams, } from 'react-navigation';
import { FlatList } from 'react-native-gesture-handler';
import { firebase, UserData } from '../../../src/firebase'
import { backOnlyOnce } from '../../../src/helpers';

type HOFButton = keyof { play: string, resume: string, restart: string };
type Players = { [key: string]: UserData }
type Props = { navigation: NavigationParams; route: { params: { button: HOFButton, } } }
type State = { loading: boolean; players: string[] }

export default class HallOfFameScreen extends React.PureComponent<Props, State> {
  navigation = this.props.navigation;
  records!: Players;
  backHandler!: NativeEventSubscription;

  constructor(props: Props) {
    super(props);
    this.state = { loading: true, players: [] };
  }

  componentDidMount() {
    console.log("HallOfFame SCREEN WILL MOUNT");
    this.getRecords();
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.backAction);
  }

  componentWillUnmount() {
    console.log("HallOfFame SCREEN WILL UUUUUUUUUUUN-MOUNT");
    this.backHandler.remove();
  }

  backAction = () => {
    backOnlyOnce(this);
    return true;
  }

  getRecords = () => {
    firebase
      .database()
      .ref('/users')
      .once('value')
      .then(snapshot => {
        this.records = snapshot.val();
        // sort records object desc
        const arr = Object.keys(this.records).sort((a,b) => this.records[b].record - this.records[a].record);
        this.setState({ players: arr, loading: false });
      })
      .catch(err => console.log(err))
  }

  back = () => {
    this.props.navigation.goBack()
  }

  render() {
    const button = this.props.route.params?.button;
    return (
      <View style={{
        flex: 1,
        ...styles.flexCenter,
      }}>
        <View style={{
          backgroundColor: 'rgba(0,0,0,0.9)',
          width: "90%",
          height: "90%",
          borderRadius: 10,
        }}>
          <View style={{
            flex: 1,
            ...styles.flexCenter,
          }}>
            <View style={{ flex: 1, justifyContent: "center", }}>
              <Text style={styles.HallOfFameLabel}>HALL OF FAME</Text>
            </View>
            <View style={{
              flex: 4,
              ...styles.flexCenter,
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
  flexCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  }
})

