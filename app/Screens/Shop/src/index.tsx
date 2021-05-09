import * as React from 'react';
import {
  NavigationScreenProp,
  NavigationState,
  NavigationInjectedProps,
  withNavigation,
  NavigationParams,
} from 'react-navigation';
import { CommonActions } from '@react-navigation/native';
import { firebase } from '../../../src/firebase'
import { Alert, ActivityIndicator, Image, SafeAreaView, StyleSheet, Text, View, Dimensions } from 'react-native';
import * as Cache from '../../../src/cache'
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image';
import Preview from '../components/Preview';
import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo';
import { 
  alert, 
  safeSetState, 
  shopRef,
  getOrientation
 } from '../../../src/helpers';
import BouncyCheckbox from 'react-native-bouncy-checkbox';

interface Props { navigation: NavigationScreenProp<NavigationState, NavigationParams> & typeof CommonActions; }
interface State { 
  items: Item[];
  gold: number;
  inventoryList: string[];
  preview: {show: boolean, loading: boolean, error: boolean};
  loading: boolean;
  checkBox: boolean;
  columns: number;
}

type Item = { 
  id: string;
  url: string;
  spriteUrl: string;
  info: any;
};

class ShopScreen extends React.PureComponent<NavigationInjectedProps & Props, State> {
  user = firebase.auth().currentUser;
  db = firebase.database();
  dbUser = this.db.ref('users/' + this.user?.uid);
  previewSprite!: string;
  netInfo!: NetInfoSubscription;
  itemsToBuy: Item[] = [];
  inventoryCache: Item[];
  inventoryListTemp!: string[]; 
  goldTemp!: number; 
  mounted = true;
  network = true;
  safeSetState: any = safeSetState(this);
  prefetches: any = {};

  constructor (props: Props | any) {
    super(props);
    this.state = { 
      items: Cache.shop.data as Item[],
      gold: Cache.user.data?.gold as number,
      inventoryList: Cache.user.data?.inventory || [],
      preview: {show: false, loading: true, error: false},
      loading: false,
      checkBox: false,
      columns: getOrientation(Dimensions.get('window')) === 'portrait' ? 2 : 3,
    };
    this.inventoryCache = Cache.inventory.data as Item[];
    shopRef(this);
  }

  componentDidMount() {
    this.netInfo = NetInfo.addEventListener(state => {
      this.network = Boolean(state.isConnected && state.isInternetReachable);
    });
    Dimensions.addEventListener('change', this.orientationChange);
  }

  componentWillUnmount() {
    this.mounted = false;
    this.safeSetState = () => null;
    shopRef(null);
    this.netInfo();
    this.dbUser.off();
    Dimensions.removeEventListener('change', this.orientationChange);
    Object.keys(this.prefetches).forEach(id => {
      Image.abortPrefetch!(this.prefetches[id]);
      console.log("== shop: abort prefetch id", id);
    });
  }

  private orientationChange = ({ window }: any) => {
    if (getOrientation(window) === 'portrait') {
      this.safeSetState({ columns: 2 });
    } else {
      this.safeSetState({ columns: 3 });
    }
  }

  private togglePreview = (url?: string) => {
    if (this.state.preview.show) {
      this.safeSetState({ preview: {show: false, loading: true, error: false} });
    } else if (url) {
      this.previewSprite = url!;
      this.safeSetState({ preview: {...this.state.preview, show: true } });
      // @ts-ignore: Unreachable code error
      Image.prefetch(url, (id: number) => this.prefetches.preview = id)
        .then(() => {
          console.log("== shop: succeed prefetch PREVIEW promise (then)");
          this.safeSetState({ preview: {...this.state.preview, loading: false} });
        })
        .catch(_ => this.safeSetState({ preview: {...this.state.preview, error: true} }))
        .finally(() => delete this.prefetches.preview);
    } else {
      this.safeSetState({ preview: {show: true, loading: true, error: true} })
    }
  }

  private updateCache = () => {
    // this.inventoryCache.push(this.itemsToBuy); // @remind
    this.inventoryCache = [...this.inventoryCache, ...this.itemsToBuy];

    Cache.inventory.update(this.inventoryCache);
    Cache.user.update({
      gold: this.goldTemp,
      inventory: this.inventoryListTemp,
    });
    this.safeSetState({ 
      inventoryList: this.inventoryListTemp,
      gold: this.goldTemp,
      loading: false 
    });
    if (this.state.checkBox) this.toggleCheckBox();
    else this.itemsToBuy = [];
    alert("Purchase Successful", "You can now equip the item");
    console.log("== shop: done update cache after buying");
  }

  private buy = () => {
    if (this.itemsToBuy.length && this.itemsToBuy[0].spriteUrl) {

      // if (Cache.user.data?.gold! < this.itemsToBuy.info.buy) return alert("NO GOLD", "Not enough gold"); // @remind
      let totalPrice = 0;
      this.itemsToBuy.forEach(item => totalPrice += item.info.buy)
      if (Cache.user.data?.gold! < totalPrice) return alert("NO GOLD", "Not enough gold");

      this.safeSetState({ loading: true });
      new Promise((_, reject) => {
        // @ts-ignore: Unreachable code error
        // Image.prefetch(this.itemsToBuy.spriteUrl, (id: number) => this.prefetches.buy = id)
        //   .then(_ => {
        //     console.log("== shop: succeed prefetch promise BUY (then)");
        //     this.dbUser.once('value') // @note possibly, inventory is undefined
        //       .then(async snapshot => {
        //         console.log("== shop: succeed firebase (user/uid).once BUY (then)");
              
        //         // const user = snapshot.val();
        //         // this.goldTemp = user.gold - this.itemsToBuy.info.buy;
        //         // this.inventoryListTemp = user.inventory as string[] || [];
        //         // this.inventoryListTemp.push(this.itemsToBuy.id);
        //         const user = snapshot.val();
        //         this.goldTemp = user.gold - totalPrice;
        //         this.inventoryListTemp = user.inventory as string[] || [];
        //         // this.inventoryListTemp.push(this.itemsToBuy.id);

        //         console.log("TEST user.inventory", user.inventory);
        //         console.log("TEST inventoryList", this.inventoryListTemp);
        //         console.log("TEST price", totalPrice)
              
        //         // this.dbUser
        //         //   .update({
        //         //     inventory: this.inventoryListTemp,
        //         //     gold: this.goldTemp
        //         //   })
        //         //   .then(_ => this.updateCache()) // @note loading false for resolve
        //         //   .catch(err => reject(err));


        //       }).catch(err => reject(err));
        //   }).catch(err => reject(err))
        //     .finally(() => delete this.prefetches.buy);

        let allSpritePromise: Promise[] = []
        this.itemsToBuy.forEach(item => {
          console.log("TEST item", item.spriteUrl);
          const promise = new Promise((resolve, reject) => {
            let prefetchID: string = "";
            // @ts-ignore: Unreachable code error
            Image.prefetch(item.spriteUrl, (id: number) => {
              prefetchID = "buy" + id;
              this.prefetches[prefetchID] = id;
            }).then(_ => resolve(item.id))
              .catch(err => reject(null))
              .finally(() => delete this.prefetches[prefetchID]);
          });
          allSpritePromise.push(promise);
        });

        Promise.all(allSpritePromise)
          .then(resolveIDs => {
            console.log("== shop: succeed prefetch promise BUY (then)", resolveIDs);

            this.dbUser.once('value') // @note possibly, inventory is undefined
              .then(async snapshot => {
                console.log("== shop: succeed firebase (user/uid).once BUY (then)");
              
                // const user = snapshot.val(); // @remind
                // this.goldTemp = user.gold - this.itemsToBuy.info.buy;
                // this.inventoryListTemp = user.inventory as string[] || [];
                // this.inventoryListTemp.push(this.itemsToBuy.id);
                const user = snapshot.val();
                this.goldTemp = user.gold - totalPrice;
                this.inventoryListTemp = user.inventory as string[] || [];
                this.inventoryListTemp = [...this.inventoryListTemp, ...resolveIDs];

                console.log("TEST user.inventory", user.inventory);
                console.log("TEST inventoryList", this.inventoryListTemp);
                console.log("TEST price", totalPrice)
              
                this.dbUser
                  .update({
                    inventory: this.inventoryListTemp,
                    gold: this.goldTemp
                  })
                  .then(_ => this.updateCache()) // @note loading false for resolve
                  .catch(err => reject(err));

              }).catch(err => reject(err));

          })
          .catch(err => reject(err));

      }).catch(_ => {
        this.safeSetState({ loading: false }); // @note loading false for reject
        alert("Processing Error", "Something went wrong");
      });
    } 
    else alert("Processing Error", "Something went wrong");
  }

  private tryBuy = (item: Item | 'marked') => {
    if (this.network) {
      
      // this.itemsToBuy = item; // @remind
      if (item !== "marked") {
        this.itemsToBuy = [];
        this.itemsToBuy.push(item);
      }
      else if (!((item === 'marked') && this.itemsToBuy.length)) return alert("SELECT ITEM", "No items to sell");
      
      Alert.alert("Hold on!", "Are you sure you want to buy?", [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel"
        },
        { 
          text: "YES", onPress: this.buy
        }
      ]);
    }
    else alert("NO INTERNET", "Please make sure you have working connection")
  }

  private toggleMark = (item: Item, isChecked: boolean | undefined) => {
    if (isChecked) this.itemsToBuy.push(item)
    else this.itemsToBuy.splice(this.itemsToBuy.indexOf(item), 1);
    this.forceUpdate();
    console.log("== shop: (toggleMark) items to sell length", this.itemsToBuy.length, "is checked", isChecked);
  }

  private toggleCheckBox = (item?: Item) => {
    if (!this.state.checkBox && item) this.toggleMark(item, true);
    else if (this.state.checkBox) this.itemsToBuy = [];
    this.safeSetState({ checkBox: !this.state.checkBox });
    console.log("== shop: (toggleCheckBox) items to sell length", this.itemsToBuy.length);
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
        {
          this.state.preview.show
            ? <View style={styles.preview1}>
                <TouchableOpacity 
                  style={styles.preview2}
                  onPress={() => this.togglePreview()}
                >
                  {
                    this.state.preview.loading
                      ? this.state.preview.error
                        ? <Text style={{color: "white"}}>Error Loading Preview</Text>
                        : <ActivityIndicator size={100} color="gray" />
                      : <Preview url={this.previewSprite}></Preview>
                  }
                </TouchableOpacity>
              </View>
            : null
        }

        {/* // @remind */}
        {/* <View style={{ height: 100, justifyContent: "flex-end", alignItems: "center" }}> 
          <Text style={{ color: "yellow", fontSize: 20, fontWeight: "bold" }}>
            Gold: {this.state.gold}
          </Text>
        </View> */}
        <View style={{ flex: 1 }}>
          <Text style={styles.gold}>
            Gold: {this.state.gold}
          </Text>

        {
          this.state.checkBox &&
          <View style={styles.sell1}>
            <TouchableOpacity 
              style={styles.sell2}
              onPress={() => this.tryBuy('marked')}>
              <Text style={styles.sell3}>BUY</Text>
            </TouchableOpacity>
          </View>
        }
        {
          this.state.items?.length
          ? <FlatList 
              key={this.state.columns} // @note believe me this is required
              data={this.state.items}
              renderItem={({ item }) => { 
                let bouncyCheckboxRef: BouncyCheckbox | null = null;
                const 
                  isChecked = this.itemsToBuy.includes(item), 
                  sold = this.state.inventoryList.includes(item.id);
                return (
                  <View style={styles.item}>

                    <View style={{ flex: 0 }}>
                      {
                        (this.state.checkBox && !sold) &&
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

                        // onPress={() => this.togglePreview(item.spriteUrl)} // @remind
                        onPress={() => this.state.checkBox ? bouncyCheckboxRef?.onPress() : this.togglePreview(item.spriteUrl)}
                        onLongPress={() => !sold ? this.toggleCheckBox(item) : null}>

                        <FastImage
                          style={{width: 100, height: 100}}
                          source={{
                              uri: item.url,
                              headers: { Authorization: 'Nani?' },
                              priority: FastImage.priority.high,
                          }}
                          resizeMode={FastImage.resizeMode.contain}
                          />

                        <Text>{item.info.description}</Text>
                      </TouchableOpacity>
                    </View>

                    {
                      // !this.state.inventoryList.includes(item.id) // @remind
                      !sold
                      ? <TouchableOpacity onPress={() => this.tryBuy(item)}>
                          <Text style={{ color:"yellow", fontSize: 12, fontWeight: "bold" }}>
                            BUY FOR {item.info.buy}
                          </Text>
                        </TouchableOpacity>
                      : <Text style={{ color:"gray", fontSize: 12, fontWeight: "bold" }}>
                          PURCHASED FOR {item.info.buy}
                        </Text>
                    }
                    
                  </View>
              )}}
              keyExtractor={(item: any) => item.id}
              numColumns={this.state.columns}
              contentContainerStyle={styles.flatlist}
            />
          : <View style={[styles.item, {flex: 0}]}>
              <Text style={{ color: "whitesmoke"}}>Loading</Text>
            </View>
        }
        </View>
      </SafeAreaView>
    )
  }

}

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
    backgroundColor: "#dfdddd59",
  },
  checkBox: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 99999,
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
  preview1: {
    width: "100%",
    height: "100%",
    backgroundColor: 'rgba(52, 52, 52, 0.8)',
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 99999,
  },
  preview2: { 
    width: "100%", 
    height: "100%", 
    justifyContent: "center", 
    alignItems: "center",
  },
  gold: { 
    color: "yellow", 
    fontSize: 20, 
    padding: 20,
    fontWeight: "bold" ,
    textAlign: "center",
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

export default withNavigation(ShopScreen);
export { Item };
