
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
import { Alert, ActivityIndicator, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as Cache from '../../../src/cacheAssets'
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image';
import { getCurrentGold } from '../../Home/src';
import Preview from '../components/Preview';
import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo';

interface Props { navigation: NavigationScreenProp<NavigationState, NavigationParams> & typeof CommonActions; }
interface State { 
  items: Item[];
  inventoryItems: string[];
  network: { connected: boolean, reachable: boolean | null | undefined };
  preview: {show: boolean, loading: boolean, error: boolean};
  loading: boolean;
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
  previewSprite!: string;
  netInfo!: NetInfoSubscription;
  item!: Item;
  inventoryCache: Item[];
  mounted = true;
  prefetches: any = {};

  constructor (props: Props | any) {
    super(props);
    this.state = { 
      items: Cache.shop.cache as Item[],
      inventoryItems: [],
      network: { connected: true, reachable: true },
      preview: {show: false, loading: true, error: false},
      loading: false,
    };
    this.inventoryCache = Cache.inventory.cache as Item[];
    this.inventoryCache?.forEach(item => this.state.inventoryItems.push(item.id));
  }

  componentDidMount() {
    this.netInfo = NetInfo.addEventListener(state => {
      this.setState({ network: { connected: state.isConnected, reachable: state.isInternetReachable } })
    });
  }

  componentWillUnmount() {
    this.mounted = false;
    this.netInfo();
    this.db.ref('users/' + this.user?.uid).off() // @note trust me, this will abort listeners - I have tested it
    Object.keys(this.prefetches).forEach(id => {
      Image.abortPrefetch!(this.prefetches[id]);
      console.log("== shop: abort prefetch id", id);
    });
  }

  private safeSetState(update: any) {
    if (this.mounted) this.setState(update);
  }

  private togglePreview = (url?: string) => {
    if (this.state.preview.show) {
      this.setState({ preview: {show: false, loading: true, error: false} });
    } else if (url) {
      this.setState({ preview: {...this.state.preview, loading: true} })
      // @ts-ignore: Unreachable code error
      Image.prefetch(url, (id: number) => this.prefetches.preview = id)
        .then(() => {
          console.log("== shop: succeed prefetch PREVIEW promise (then)");
          this.safeSetState({ preview: {...this.state.preview, loading: false} });
        })
        .catch(_ => this.safeSetState({ preview: {...this.state.preview, error: true} }))
        .finally(() => delete this.prefetches.preview);
      this.previewSprite = url!;
      this.setState({ preview: {...this.state.preview, show: true} });
    } else {
      this.setState({ preview: {...this.state.preview, show: true, error: true} })
    }
  }

  private updateCache = () => {
    this.inventoryCache.push(this.item);
    Cache.inventory.update(this.inventoryCache);
    this.safeSetState({ 
      inventoryItems: [...this.state.inventoryItems, this.item.id], 
      loading: false 
    });
    this.alert("Purchase Successful", "You can now equip the item");
    console.log("== shop: done update cache after buying");
  }

  private buy = () => {
    if (this.item.spriteUrl) {
      this.safeSetState({ loading: true });
      // @ts-ignore: Unreachable code error
      // Image.prefetch(this.item.spriteUrl, (id: number) => this.prefetches.sprite = id)
      //   .then(_ => {
      //     console.log("== shop: succeed prefetch promise (then)");
      //     this.db.ref('users/' + this.user?.uid)
      //       .once('value')
      //       .then(async snapshot => {
      //         const inventory = snapshot.val().inventory || [];
      //         inventory.push(this.item.id)
      //         this.db.ref('users/' + this.user?.uid)
      //           .update({
      //             inventory: inventory,
      //             gold: getCurrentGold() - this.item.info.buy
      //           })
      //           .then(_ => this.updateCache())
      //           .catch(_ => {
      //             this.safeSetState({ loading: false });
      //             this.alert("Processing Error", "Something went wrong");
      //           });
      //       })
      //       .catch(_ => {
      //         this.safeSetState({ loading: false });
      //         this.alert("Processing Error", "Something went wrong");
      //       });
      //   })
      //   .catch(_ => {
      //     this.safeSetState({ loading: false });
      //     this.alert("Processing Error", "Something went wrong");
      //   })
      //   .finally(() => delete this.prefetches.sprite);

      new Promise((_, reject) => {
        // @ts-ignore: Unreachable code error
        Image.prefetch(this.item.spriteUrl, (id: number) => this.prefetches.buy = id)
          .then(_ => {
            console.log("== shop: succeed prefetch promise BUY (then)");
            this.db.ref('users/' + this.user?.uid)
              .once('value')
              .then(async snapshot => {
                console.log("== shop: succeed firebase (user/uid).once BUY (then)")
                const inventory = snapshot.val().inventory || [];
                inventory.push(this.item.id)
                this.db.ref('users/' + this.user?.uid)
                  .update({
                    inventory: inventory,
                    gold: getCurrentGold() - this.item.info.buy
                  })
                  .then(_ => this.updateCache()) // @note loading false for resolve
                  .catch(err => reject(err));
              }).catch(err => reject(err));
          }).catch(err => reject(err))
            .finally(() => delete this.prefetches.buy);
      }).catch(_ => {
        this.safeSetState({ loading: false }); // @note loading false for reject
        this.alert("Processing Error", "Something went wrong");
      })
    } 
    else this.alert("Processing Error", "Something went wrong")
  }

  private tryBuy = (item: Item) => {
    if (this.state.network.connected && this.state.network.reachable) {
      this.item = item;
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
    else this.alert("NO INTERNET", "Please make sure you have working connection")
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

        <View style={{ height: 100, justifyContent: "flex-end", alignItems: "center" }}>
          <Text style={{ color: "yellow", fontSize: 20, fontWeight: "bold" }}>
            Gold: {getCurrentGold()}
          </Text>
        </View>
        {
          this.state.items?.length
          ? <FlatList 
              contentContainerStyle={styles.flatlist}
              data={this.state.items}
              renderItem={({ item }) => { return (
                <View style={styles.item}>
                  <TouchableOpacity 
                    style={styles.touchable} 
                    onPress={() => this.togglePreview(item.spriteUrl)}>
                      
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
                  
                  {
                    !this.state.inventoryItems.includes(item.id)
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
              numColumns={2}
            />
          : <View style={[styles.item, {flex: 0}]}>
              <Text style={{ color: "whitesmoke"}}>Loading</Text>
            </View>
        }
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
  flatlist: {flex: 1, justifyContent: "center",},
  item: {
    flex: 1,
    height: 180,  
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#dfdddd59",
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
});

export default withNavigation(ShopScreen);
export { Item }
