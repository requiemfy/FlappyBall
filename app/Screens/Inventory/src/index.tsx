
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
import { getCurrentGold } from '../../Home/src';
import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo';

interface Props { navigation: NavigationScreenProp<NavigationState, NavigationParams> & typeof CommonActions; }
interface State { 
  items: Item[];
  network: boolean;
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
  backHandler!: NativeEventSubscription;
  netInfo!: NetInfoSubscription ;

  constructor(props: Props | any) {
    super(props);
    this.state = { 
      items: JSON.parse(Cache.inventory.cache),
      network: true,
    };
  }

  componentDidMount() {
    console.log("Inventorys MOUNT");
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.backAction);

    this.netInfo = NetInfo.addEventListener(state => {
      this.setState({ network: state.isConnected })
    });
  }

  componentWillUnmount() {
    console.log("Inventorys UN-MOUNT")
    this.backHandler.remove();
    this.netInfo();
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
    else {
      Image.prefetch(sprite)
        .then(arg => console.log("FETCHING SPRITE FINISHED", arg))
        .catch(err => console.log("Fetching sprite error:", err));

      activeItem.ballySprite = sprite;
      activeItem.id = id;
    }
    this.forceUpdate();
  }

  private sellItem = (id: string) => {
    firebase
      .database()
      .ref('users/' + this.user?.uid + '/inventory')
      .once('value')
      .then(snapshot => {
        const inventory = snapshot.val();
        inventory.splice(inventory.indexOf(id), 1);

        firebase
          .database()
          .ref('users/' + this.user?.uid)
          .update({ inventory: inventory })
          .then(arg => console.log("SUCCESS selling"))
          .catch(err => console.log(err));
        
        Cache.inventory.clear()
          .then(async () => {
            if (id === activeItem.id) this.normalSprite();

            await new Promise((resolve, reject) => Cache.inventory.fetch(resolve, reject))
              .then(_ => this.setState({ items: JSON.parse(Cache.inventory.cache) }))
              .catch(err => console.log("Selling Error:", err));
          });
      })
      .catch(err => console.log("Selling", err))
  }

  private trySell = async (id: string) => {
    if (this.state.network) 
      Alert.alert("Hold on!", "Are you sure you want to sell?", [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel"
        },
        { 
          text: "YES", onPress: () => this.sellItem(id)
        }
      ]);
    else
      Alert.alert("NO INTERNET", "connection!", [
        { 
          text: "OK", onPress: () => null
        }
      ]);
  }

  render() {
    
    return(
      <SafeAreaView style={styles.safeArea}>
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
                  <TouchableOpacity onPress={() => this.trySell(item.id)}>
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
export { getBallSprite }
