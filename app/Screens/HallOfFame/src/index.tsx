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
import { UserData } from '../../../src/firebase';
import { backOnlyOnce, safeSetState } from '../../../src/helpers';
import * as Cache from '../../../src/cache';
import NetInfo from '@react-native-community/netinfo';

type HOFButton = keyof { play: string, resume: string, restart: string };
type Players = { [key: string]: UserData }
type Props = { navigation: NavigationParams; route: { params: { button: HOFButton, } } }
type State = { loading: boolean; players: string[] }

export default class HallOfFameScreen extends React.PureComponent<Props, State> {
  navigation = this.props.navigation;
  records!: Players;
  backHandler!: NativeEventSubscription;
  noMoreButtons = false;
  mounted = true;
  safeSetState: any = safeSetState(this);

  constructor(props: Props) {
    super(props);
    this.state = { loading: true, players: [], };
  }

  componentDidMount() {
    console.log("HallOfFame SCREEN WILL MOUNT");
    this.getRecords();
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.backAction);
  }

  componentWillUnmount() {
    console.log("HallOfFame SCREEN WILL UUUUUUUUUUUN-MOUNT");
    this.mounted = false;
    this.safeSetState = () => null;
    this.backHandler.remove();
  }

  private backAction = () => {
    backOnlyOnce(this);
    return true;
  }

  private getRecords = () => {
    console.log("== hall of fame: Trying to fetch all player records");
    NetInfo.fetch().then(status => {
      const network = Boolean(status.isConnected && status.isInternetReachable);
      if (!network) Cache.hallOfFame.data && this.sortRecords(Cache.hallOfFame.data);
      else new Promise((resolve, reject) => Cache.hallOfFame.fetch(resolve, reject))
        .then((result: any) => this.sortRecords(result))
        .catch(err => console.log("== hall of fame: Error 2", err));
    });
  }

  private sortRecords = (records: any) => {
    this.records = records;
    //  sort records object desc
    const arr = Object.keys(this.records).sort((a,b) => this.records[b].record - this.records[a].record);
    this.safeSetState({ players: arr, loading: false });
  }

  private back = () => {
    if (this.noMoreButtons) return;
    this.noMoreButtons = true;
    this.props.navigation.goBack()
  }

  render() {
    const button = this.props.route.params?.button;
    return (
      <View style={[{flex: 1}, styles.flexCenter]}>
        <View style={styles.container1}>
          <View style={[{flex: 1}, styles.flexCenter]}>
            <View style={styles.HOFtxtCont}>
              <Text style={styles.HOFtxt}>HALL OF FAME</Text>
            </View>
            <View style={[{flex: 4}, styles.flexCenter]}>
            {
              this.state.loading 
                ? <ActivityIndicator size="large" color="white" />
                : <FlatList
                    data={this.state.players}
                    renderItem={({ item }) => {
                      return (
                        <View style={styles.itemCont1}>
                          <Text style={styles.codeName}>{this.records[item].codeName}</Text>
                          <Text style={styles.record}>{this.records[item].record}</Text>
                        </View>
                      );
                    }}
                    keyExtractor={(item, index) => index.toString()} />
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
  HOFtxtCont: { flex: 1, justifyContent: "center", },
  HOFtxt: { fontSize: 20, fontWeight: "bold", color: "white" },
  buttonCont: {},
  HOFButton: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
  },
  flexCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container1: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    width: "90%",
    height: "90%",
    borderRadius: 10,
  },
  itemCont1: {
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "black", 
    paddingTop: 10,
    paddingBottom: 10,
    width: 200
  },
  codeName: { 
    fontSize: 18, 
    color: "white", 
  },
  record: { 
    fontSize: 20, 
    color: "white", 
    fontStyle: "italic",
    fontWeight: "bold",
  },
})

