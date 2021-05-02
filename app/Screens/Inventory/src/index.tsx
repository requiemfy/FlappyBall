import * as React from 'react';
import { 
  Alert, 
  Image, 
  StyleSheet, 
  View, 
  ActivityIndicator, 
  Text, 
  NativeEventSubscription, 
  BackHandler 
} from 'react-native';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import {
  NavigationScreenProp,
  NavigationState,
  NavigationInjectedProps,
  withNavigation,
  NavigationParams,
} from 'react-navigation';
import { CommonActions } from '@react-navigation/native';
import { firebase } from '../../../src/firebase'
import { alert, backOnlyOnce, safeSetState, inventoryRef } from '../../../src/helpers';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Cache from '../../../src/cache';
import { Asset } from 'expo-asset';
import FastImage from 'react-native-fast-image'
import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo';

interface Props { navigation: NavigationScreenProp<NavigationState, NavigationParams> & typeof CommonActions; }
interface State { 
  items: Item[];
  gold: number;
  network: boolean;
  loading: boolean;
}

type Item = { 
  id: string, 
  url: string, 
  spriteUrl: string , 
  info: any
};
type Active = { ballySprite: string, id: null | string };

let activeItem: Active = {
  ballySprite: Asset.fromModule(require('../../Game/assets/bally/bally.png')).uri,
  id: null
};

class InventoryScreen extends React.PureComponent<NavigationInjectedProps & Props, State> {
  user = firebase.auth().currentUser;
  db = firebase.database();
  dbRefs = {
    usr: this.db.ref('users/' + this.user?.uid),
    inventory: this.db.ref('users/' + this.user?.uid + '/inventory'),
  };
  navigation = this.props.navigation;
  mounted = true;
  safeSetState: any = safeSetState(this);
  backHandler!: NativeEventSubscription;
  netInfo!: NetInfoSubscription;
  item!: Item;
  inventoryListTemp!: string[];
  goldTemp!: number;
  prefetches: any = {};

  constructor(props: NavigationInjectedProps & Props) {
    super(props);
    this.state = { 
      items: Cache.inventory.data,
      gold: Cache.user.data?.gold as number,
      network: true,
      loading: false,
    };
    inventoryRef(this);
    console.log("== inventory: items", this.state.items)
  }

  componentDidMount() {
    console.log("Inventorys MOUNT");
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.backAction);
    this.netInfo = NetInfo.addEventListener(state => {
        this.safeSetState({ network: Boolean(state.isConnected && state.isInternetReachable) });
    });
  }

  componentWillUnmount() {
    console.log("== inventory: UN-MOUNT")
    this.mounted = false;
    this.safeSetState = () => null;
    inventoryRef(null);
    this.backHandler.remove();
    this.netInfo();
    Object.keys(this.dbRefs).forEach((key: any) => (this.dbRefs as any)[key].off())
    Object.keys(this.prefetches).forEach(id => {
      Image.abortPrefetch!(this.prefetches[id]);
      console.log("== inventory: aborted prefetches id", id);
    });
  }

  private backAction = () => {
    backOnlyOnce(this);
    return true; // @note this has purpose
  }

  private selectItem = (item: Item) => {
    console.log("== inventory: equip item");
    if (item.id === activeItem.id) resetBallSprite() // disselect item
    else if (!item.spriteUrl)  
      Alert.alert("", "Something went wrong", [
        { 
          text: "OK", onPress: () => null
        }
      ]);
    else {
      console.log("== inventory: trying to fetch item sprite...");
      this.safeSetState({ loading: true });
      // @ts-ignore: Unreachable code error
      Image.prefetch(item.spriteUrl, (id: number) => this.prefetches.sprite = id) 
        .then(_ => {
          console.log("== inventory: Succeed prefetch promise (then)");
          activeItem.ballySprite = item.spriteUrl;
          activeItem.id = item.id;
        })
        .catch(_ => {
          console.log("== inventory: Failed prefetch");
          alert("Processing Failed", "Something went wrong");
        })
        .finally(() => {
          console.log("== inventory: finally prefetch, whatever");
          delete this.prefetches.sprite;
          this.safeSetState({ loading: false });
        });
    }
    this.forceUpdate();
  }

  private updateCache = () => {
    console.log("== inventory: Updating cache, removing sold item, current count", this.state.items.length);    
    const invntTmp = this.state.items;
    invntTmp.splice(invntTmp.indexOf(this.item), 1);
    console.log("== inventory: Success removing item, count", invntTmp.length);
    Cache.inventory.update(invntTmp); // @note changes number of items in screen
    Cache.user.update({
      gold: this.goldTemp,
      inventory: this.inventoryListTemp,
    });
    this.safeSetState({ items: invntTmp, gold: this.goldTemp, loading: false });
    console.log("== inventory: Success cache update after selling");
  }

  private sellItem = () => {
    this.safeSetState({ loading: true });
    new Promise((_, reject) => {
      console.log("== inventory: Trying to fetch firebase in selling...");
      this.dbRefs.inventory.once('value') // @note prefered to get fresh data
        .then(async snapshot => {
          console.log("== inventory: Succeed to fetch firebase in selling");
          this.inventoryListTemp = snapshot.val();
          this.inventoryListTemp.splice(this.inventoryListTemp.indexOf(this.item.id), 1);
          this.goldTemp = this.state.gold + (this.item.info.buy / 2);
          if (this.state.network) this.dbRefs.usr
            .update({ 
              inventory: this.inventoryListTemp,
              gold: this.goldTemp,
            })
            .then(_ => {
              console.log("== inventory: Success updating database")
              this.updateCache()
              if (this.item.id === activeItem.id) {
                console.log("== inventory: Deactivating sprite since it was sold")
                resetBallSprite();
                this.forceUpdate();
              }
            }) // @note resolve loading false
            .catch(err => reject(err));
        }).catch(err => reject(err));
    }).catch(_ => {
      this.safeSetState({ loading: false }); // @note reject loading false
      alert("Processing Error", "Something went wrong")
    });
  }

  private trySell = async (item: Item) => {
    if (this.state.network) {
      this.item = item;
      Alert.alert("Hold on!", "Are you sure you want to sell?", [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel"
        },
        { 
          text: "YES", onPress: this.sellItem
        }
      ]);
    }
    else alert("NO INTERNET", "Please make sure you have working connection");
  }

  render() {
    
    return(
      <SafeAreaView style={styles.safeArea}>
        {
          this.state.loading
          ? <View style={styles.loading1}>
              <View style={styles.loading2}>
                <ActivityIndicator size={100} color="gray" />
              </View>
            </View>
          : null
        }
        <View style={styles.gold1}>
          <Text style={styles.gold2}>
            Gold: {this.state.gold}
          </Text>
        </View>
        {
          this.state.items.length
          ? <FlatList 
              contentContainerStyle={styles.flatlist}
              data={this.state.items}
              renderItem={({ item }) => { return (
                <View style={[
                  styles.item,
                  {backgroundColor: activeItem.id === item.id ? "green" : "#dfdddd59"}
                ]}>
                  <TouchableOpacity 
                    style={styles.touchable} 
                    onPress={() => this.selectItem(item)}>
                      
                      <FastImage
                        style={{width: 100, height: 100}}
                        source={{
                            uri: item.url,
                            headers: { Authorization: 'someAuthToken' },
                            priority: FastImage.priority.high,
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                      />

                    <Text>{item.info.description}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.trySell(item)}>
                    <Text style={{ color:"yellow", fontSize: 12, fontWeight: "bold" }}>SELL FOR {item.info.buy/2}</Text>
                  </TouchableOpacity>
                </View>
              )}}
              keyExtractor={(item: any) => item.id}
              numColumns={2}
            />
          : <View style={[styles.item, {flex: 0}]}>
              <Text style={{ color: "whitesmoke"}}>NO ITEMS</Text>
            </View>
        }
      </SafeAreaView>
    );
  }
}

function getBallSprite() {
  return activeItem.ballySprite;
}

function resetBallSprite() {
  console.log("== inventory: reset sprite")
  activeItem = {
    ballySprite: Asset.fromModule(require('../../Game/assets/bally/bally.png')).uri,
    id: null
  };
}

// ===========================================================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  flatlist: {flex: 1, justifyContent: "center",},
  item: {
    flex: 1,
    height: 180,  
    justifyContent: "center",
    alignItems: "center",
  },
  touchable: {
    borderRadius: 10,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "gray", 

    elevation: 50,
    shadowColor: 'black',
  },
  loading1: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    backgroundColor: 'rgba(52, 52, 52, 0.2)',
    alignItems: "center",
    zIndex: 99999,
  },
  loading2: {
    width: "90%",
    height: "50%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(52, 52, 52, 0.8)',
    elevation: 5,
    borderRadius: 50,
  },
  gold1: { height: 100, justifyContent: "flex-end", alignItems: "center" },
  gold2: { color: "yellow", fontSize: 20, fontWeight: "bold" }
});

export default withNavigation(InventoryScreen);
export { getBallSprite, resetBallSprite, activeItem }
