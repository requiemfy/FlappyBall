
import * as React from 'react';
import { Alert, Button, Image, StyleSheet, View, ActivityIndicator, Platform, Dimensions, Text, NativeEventSubscription, BackHandler } from 'react-native';
import { FlatList, ScrollView, TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import {
  NavigationScreenProp,
  NavigationState,
  NavigationInjectedProps,
  withNavigation,
  NavigationParams,
} from 'react-navigation';
import { CommonActions } from '@react-navigation/native';
import { firebase } from '../../../src/firebase'
import { backOnlyOnce } from '../../../src/helpers';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Cache from '../../../src/cacheAssets';
import { Asset } from 'expo-asset';
import CacheStorage from 'react-native-cache-storage';
import CachedImage from '../../../Components/CachedImage';
import FastImage from 'react-native-fast-image'
import { getCurrentGold, setCurrentGold } from '../../Home/src';
import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo';

interface Props { navigation: NavigationScreenProp<NavigationState, NavigationParams> & typeof CommonActions; }
interface State { 
  items: Item[];
  network: {connected: boolean; reachable: boolean | null | undefined;};
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
  navigation = this.props.navigation;
  user = firebase.auth().currentUser;
  thisMounted = true;
  backHandler!: NativeEventSubscription;
  netInfo!: NetInfoSubscription;
  item!: Item;

  constructor(props: NavigationInjectedProps & Props) {
    super(props);
    this.state = { 
      // items: JSON.parse(Cache.inventory.cache), // @remind clear
      items: Cache.inventory.cache,
      network: {connected: true, reachable: true},
      loading: false,
    };
  }

  componentDidMount() {
    console.log("Inventorys MOUNT");
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.backAction);

    this.netInfo = NetInfo.addEventListener(state => {
      this.setState({ network: { connected: state.isConnected, reachable: state.isInternetReachable } })
    });
  }

  componentWillUnmount() {
    console.log("Inventorys UN-MOUNT")
    this.backHandler.remove();
    this.netInfo();
    this.thisMounted = false;

    this.normalSprite;
  }

  private backAction = () => {
    backOnlyOnce(this);
    return true;
  }

  private normalSprite = () => {
    activeItem.ballySprite = Asset.fromModule(require('../../Game/assets/bally/bally.png')).uri;
    activeItem.id = null;
  } 

  private selectItem = (id: string, sprite: string) => {
    if (id === activeItem.id) this.normalSprite() // disselect item

    else if (!sprite)  
      Alert.alert("", "Something went wrong", [
        { 
          text: "OK", onPress: () => null
        }
      ]);

    else {
      this.setState({ loading: true });
      Image.prefetch(sprite)
        .then(_ => this.thisMounted ? this.setState({ loading: false }) : null)
        .catch(_ => {
          this.thisMounted ? this.setState({ loading: false }) : null;
          this.alert("Processing Failed", "Something went wrong");
        });

      activeItem.ballySprite = sprite;
      activeItem.id = id;
    }
    this.forceUpdate();
  }

  private updateCache = () => {
    // Cache.inventory.storage.setItem('inventory', '', 60 * 60 * 24)
    //   .then(async () => {
    //     console.log("TEST Selling: Cache Cleared");
    //     if (this.item.id === activeItem.id) this.normalSprite();
    //     new Promise((resolve, reject) => Cache.inventory.fetch(resolve, reject))
    //       .then(_ => {
    //         setCurrentGold(getCurrentGold() + this.item.info.buy/2)
    //         this.setState({ items: Cache.inventory.cache });

    //         // this.updateGold(getCurrentGold());
    //         // updateGold(this.user?.uid, getCurrentGold())

    //         // new Promise((resolve, reject) => {
    //         //   updateGold(this.user?.uid, getCurrentGold(), resolve, reject)
    //         // }).then(_ => null)
    //         //   .catch(_ => null)
            
    //       })
    //       .catch(err => console.log("TEST Selling Error 3", err));
    //   });

    const inventory = this.state.items;
    this.state.items.some(item => {
      if (item.id === this.item.id) {
        inventory.splice(inventory.indexOf(item), 1);
        return true;
      }
      else return false;
    });
    Cache.inventory.update(inventory);
    this.thisMounted ? this.setState({ items: inventory, loading: false }) : null;

    // this.inventoryCache.push(this.item);
    // Cache.inventory.update(this.inventoryCache);
    // this.setState({ items: [...this.state.items] });
  }

  // private updateGold = (updated: number) => { // @remind clear
  //   firebase
  //     .database()
  //     .ref('users/' + this.user?.uid)
  //     .update({ gold: updated })
  //     .catch(err => console.log("Updating Gold Error", err));
  // }

  private sellItem = () => {
    this.setState({ loading: true });
    firebase
      .database()
      .ref('users/' + this.user?.uid + '/inventory')
      .once('value')
      .then(async snapshot => {
        const inventory = snapshot.val();
        inventory.splice(inventory.indexOf(this.item.id), 1);

        firebase
          .database()
          .ref('users/' + this.user?.uid)
          .update({ 
            inventory: inventory,
            gold: getCurrentGold() + (this.item.info.buy / 2),
          })
          .then(_ => this.updateCache())
          .catch(_ => {
            this.thisMounted ? this.setState({ loading: false }) : null;
            this.alert("Processing Error", "Something went wrong");
          });
      })
      .catch(err => {
        this.thisMounted ? this.setState({ loading: false }) : null;
        this.alert("Processing Error", "Something went wrong")
    })
  }

  private trySell = async (item: Item) => {
    // @remind what if has signal but netwok (limited)
    if (this.state.network.connected && this.state.network.reachable) {
      // this.itemID = id;
      // this.itemSale = sale;
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
    else this.alert("NO INTERNET", "Please make sure you have working connection");
  }

  private alert = (one: string, two: string) => {
    Alert.alert(one, two, [
      { 
        text: "OK", onPress: () => null
      }
    ]);
  }

  render() {
    
    return(
      <SafeAreaView style={styles.safeArea}>
        {
          this.state.loading
          ? <View style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              justifyContent: "center",
              backgroundColor: 'rgba(52, 52, 52, 0.2)',
              alignItems: "center",
              zIndex: 99999,
            }}>
              <View style={{
                width: "90%",
                height: "50%",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: 'rgba(52, 52, 52, 0.8)',
                elevation: 5,
                borderRadius: 50,
              }}>
                <ActivityIndicator size={100} color="gray" />
              </View>
            </View>
          : null
        }
        <View style={{ height: 100, justifyContent: "flex-end", alignItems: "center" }}>
          <Text style={{ color: "yellow", fontSize: 20, fontWeight: "bold" }}>
            Gold: {getCurrentGold()}
          </Text>
        </View>
        {
          this.state.items.length
          ? <FlatList 
              contentContainerStyle={styles.flatlist}
              data={this.state.items}
              renderItem={({ item }) => { return (
                <View style={{
                  ...styles.item,
                  backgroundColor: activeItem.id === item.id ? "green" : "#dfdddd59"
                }}>
                  <TouchableOpacity 
                    style={styles.touchable} 
                    onPress={() => this.selectItem(item.id, item.spriteUrl)}>
                      
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
});

export default withNavigation(InventoryScreen);
export { getBallSprite, activeItem }
