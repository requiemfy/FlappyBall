import * as React from 'react';
import { 
  Alert, 
  Image, 
  StyleSheet, 
  View, 
  ActivityIndicator, 
  Text, 
  NativeEventSubscription, 
  BackHandler, 
  Dimensions,
} from 'react-native';
import { 
  FlatList, 
  TouchableOpacity, 
} from 'react-native-gesture-handler';
import {
  NavigationScreenProp,
  NavigationState,
  NavigationInjectedProps,
  withNavigation,
  NavigationParams,
} from 'react-navigation';
import { CommonActions } from '@react-navigation/native';
import { firebase } from '../../../src/firebase'
import { 
  alert, 
  backOnlyOnce, 
  safeSetState, 
  inventoryRef, 
  getOrientation
} from '../../../src/helpers';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Cache from '../../../src/cache';
import { Asset } from 'expo-asset';
import FastImage from 'react-native-fast-image'
import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo';
import BouncyCheckbox from "react-native-bouncy-checkbox";

interface Props { navigation: NavigationScreenProp<NavigationState, NavigationParams> & typeof CommonActions; }
interface State { 
  rendering: boolean,
  items: Item[];
  gold: number;
  network: boolean;
  loading: boolean;
  checkBox: boolean;
  columns: number;
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
  itemsToSell: Item[] = [];
  inventoryListTemp!: string[];
  goldTemp!: number;
  prefetches: any = {};
  isAllChecked = false;
  lockButtons = false;

  constructor(props: NavigationInjectedProps & Props) {
    super(props);
    this.state = { 
      rendering: false,
      items: Cache.inventory.data,
      gold: Cache.user.data?.gold as number,
      network: true,
      loading: false,
      checkBox: false,
      columns: getOrientation(Dimensions.get('window')) === 'portrait' ? 2 : 3,
    };
    inventoryRef(this);
    console.log("== inventory: items", this.state.items)
  }

  componentDidMount() {
    console.log("Inventorys MOUNT");
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.backAction);
    this.netInfo = NetInfo.addEventListener(state => {
      const update = Boolean(state.isConnected && state.isInternetReachable);
      if (update !== this.state.network) this.safeSetState({ network: update });
    });
    Dimensions.addEventListener('change', this.orientationChange);
  }

  componentWillUnmount() {
    console.log("== inventory: UN-MOUNT")
    this.mounted = false;
    this.safeSetState = () => null;
    inventoryRef(null);
    this.backHandler.remove();
    this.netInfo();
    Dimensions.removeEventListener('change', this.orientationChange);
    Object.keys(this.dbRefs).forEach((key: any) => (this.dbRefs as any)[key].off())
    Object.keys(this.prefetches).forEach(id => {
      Image.abortPrefetch!(this.prefetches[id]);
      console.log("== inventory: aborted prefetches id", id);
    });
  }

  componentDidUpdate() {
    if (this.state.rendering) setTimeout(() => this.safeSetState({ rendering: false }), 0);
  }

  private unlockButtons = () => this.lockButtons = false;

  private clearSelections = () => {
    if (this.state.checkBox) this.toggleCheckBox();
    else this.itemsToSell = []; // @note this is for the case of 1 item buy 
  }

  private orientationChange = ({ window }: any) => {
    this.safeSetState({ rendering: true });
    if (getOrientation(window) === 'portrait') {
      this.safeSetState({ columns: 2 });
    } else {
      this.safeSetState({ columns: 3 });
    }
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
    let invntTmp = this.state.items;
    invntTmp = invntTmp.filter((item: Item) => !this.itemsToSell.includes(item));
    console.log("== inventory: Success removing item, count", invntTmp.length);
    Cache.inventory.update(invntTmp); // @note changes number of items in screen
    Cache.user.update({
      gold: this.goldTemp,
      inventory: this.inventoryListTemp,
    });
    this.safeSetState({ items: invntTmp, gold: this.goldTemp, loading: false });
    this.clearSelections();
    this.unlockButtons(); 
    console.log("== inventory: Success cache update after selling");
  }

  private sellItems = () => {
    new Promise((_, reject) => {
      console.log("== inventory: Trying to fetch firebase in selling...");
      this.dbRefs.inventory.once('value') // @note prefered to get fresh data
        .then(async snapshot => {
          console.log("== inventory: Succeed to fetch firebase in selling");
          const itemIDlist = snapshot.val();
          const itemIDsToSell = this.itemsToSell.map((item: Item) => item.id);
          this.inventoryListTemp = itemIDlist.filter((itemID: string) => !itemIDsToSell.includes(itemID));
          this.goldTemp = this.state.gold;
          this.itemsToSell.forEach(item => this.goldTemp += (item.info.buy/2));
          if (this.state.network) this.dbRefs.usr
            .update({ 
              inventory: this.inventoryListTemp,
              gold: this.goldTemp,
            })
            .then(_ => {
              console.log("== inventory: Success updating database");
              this.updateCache(); // @note resolve loading false
              if (itemIDsToSell.includes(activeItem.id!)) {
                resetBallSprite();
                this.mounted && this.forceUpdate();
              }
            })
            .catch(err => reject(err));
        }).catch(err => reject(err));
    }).catch(_ => {
      this.safeSetState({ loading: false }); // @note reject loading false
      alert("Processing Error", "Something went wrong", this.unlockButtons());
    });
  }

  private trySell = async (item: Item | 'marked') => {
    if (this.lockButtons) return;
    this.lockButtons = true;
    if (this.state.network) {
      if (item !== "marked") {
        this.itemsToSell = [];
        this.itemsToSell.push(item);
      }
      else if (!((item === 'marked') && this.itemsToSell.length)) return alert("SELECT ITEM", "No items to sell", this.unlockButtons);
      this.safeSetState({ loading: true });
      Alert.alert("Hold on!", "Are you sure you want to sell?", [
        {
          text: "Cancel",
          onPress: () => {
            this.safeSetState({ loading: false });
            this.unlockButtons();
          },
          style: "cancel"
        },
        { 
          text: "YES", onPress: this.sellItems
        }
      ]);
    }
    else alert("NO INTERNET", "Please make sure you have working connection", this.unlockButtons);
  }

  private toggleCheckBox = (item?: Item) => {
    this.itemsToSell = [];
    this.isAllChecked = false;
    if (!this.state.checkBox && item) this.toggleMark(item, true);
    this.safeSetState({ checkBox: !this.state.checkBox });
    console.log("== inventory: (toggleCheckBox) items to sell length", this.itemsToSell.length);
  }

  private toggleMark = (item: Item, isChecked: boolean | undefined) => {
    if (isChecked) this.itemsToSell.push(item)
    else {
      this.itemsToSell.splice(this.itemsToSell.indexOf(item), 1);
      this.isAllChecked = false;
    };
    this.forceUpdate();
    console.log("== inventory: (toggleMark) items to sell length", this.itemsToSell.length, "is checked", isChecked);
  }

  private selectAll = () => {
    this.isAllChecked = !this.isAllChecked;
    if (this.isAllChecked) this.itemsToSell = [...this.state.items]; // @note shallow copy, objects are passed by reference, this is useful for comparison such as array.includes
    // if (isChecked) this.itemsToSell = JSON.parse(JSON.stringify(this.state.items)); // @note deep copy, objects are passed by balue, not working for comparing objects
    else this.itemsToSell = [];
    this.forceUpdate();
    console.log("== inventory: (selectAll) items to sell length", this.itemsToSell.length, "is checked", this.isAllChecked);
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
        <View style={{flex: 1}}>
          <Text style={styles.gold}>
            Gold: {this.state.gold}
          </Text>
          {
            this.state.checkBox &&
            <View style={styles.sell1}>
              <TouchableOpacity 
                style={styles.sell2}
                onPress={() => this.trySell('marked')}>
                <Text style={styles.sell3}>SELL</Text>
              </TouchableOpacity>
              <BouncyCheckbox
                isChecked={this.isAllChecked}
                text="Select All"
                onPress={this.selectAll} 
                fillColor="black"
                unfillColor="#393939"
                bounceFriction={0}
                textStyle={{ fontSize: 15, textDecorationLine: 'none',}}
                iconStyle={{ borderColor: "white",  borderRadius: 10 }}
                style={{ padding: 5 }}
                useNativeDriver={true}
                disableBuiltInState
              />
            </View>
          }
        {
          this.state.items.length && !this.state.rendering
          ? <FlatList 
              key={this.state.columns} // @note believe me this is required
              data={this.state.items}
              renderItem={({ item }) => { 
                let bouncyCheckboxRef: BouncyCheckbox | null = null;
                const isChecked = this.itemsToSell.includes(item);
                return (
                  <View style={[
                    styles.item,
                    {backgroundColor: activeItem.id === item.id ? "green" : "#dfdddd59"}
                  ]}>
                    <View style={{ flex: 0 }}>
                      {
                        this.state.checkBox &&
                          <BouncyCheckbox 
                            ref={(ref: any) => bouncyCheckboxRef = ref}
                            isChecked={isChecked}
                            onPress={() => this.toggleMark(item, !isChecked)} 
                            disableText={true}
                            fillColor="black"
                            unfillColor="#393939"
                            iconStyle={{ borderColor: "white" }}
                            style={styles.checkBox}
                            disableBuiltInState
                          />
                      }
                      <TouchableOpacity 
                        style={styles.touchable} 
                        onPress={() => this.state.checkBox ? bouncyCheckboxRef?.onPress() : this.selectItem(item)}
                        onLongPress={() => this.toggleCheckBox(item)}>
                        <FastImage
                          style={{ width: 100, height: 100 }}
                          source={{
                            uri: item.url,
                            headers: {Authorization: 'someAuthToken'},
                            priority: FastImage.priority.high,
                          }}
                          resizeMode={FastImage.resizeMode.contain}
                        />
                        <Text>{item.info.description}</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => this.trySell(item)}>
                      <Text style={{ color:"yellow", fontSize: 12, fontWeight: "bold" }}>SELL FOR {item.info.buy/2}</Text>
                    </TouchableOpacity>
                  </View>
                )}}
              keyExtractor={(item: any) => item.id}
              numColumns={this.state.columns}
              contentContainerStyle={styles.flatlist}
            />
          : <View style={[styles.item, {flex: 1}]}>
              <Text style={{ color: "whitesmoke", fontSize: 100}}>…</Text>
            </View>
        }
        </View>
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
  flatlist: {
    flexGrow: 1, 
    justifyContent: "center",
  },
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
  gold: { 
    color: "yellow", 
    fontSize: 20, 
    padding: 20,
    fontWeight: "bold" ,
    textAlign: "center",
  },
  checkBox: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 99999,
  },
  sell1: {
    flexDirection: "row",
    margin: 5,
  },
  sell2: {
    backgroundColor: "gray",
    marginRight: 10,
    borderRadius: 20,
  },
  sell3: {
    padding: 10,
    fontSize: 17,
    fontWeight: 'bold',
    color: "yellow",
  },
});

export default withNavigation(InventoryScreen);
export { getBallSprite, resetBallSprite, activeItem }
