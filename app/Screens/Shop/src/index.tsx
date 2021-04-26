
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
}

type Item = { 
  id: string;
  url: string;
  spriteUrl: string;
  info: any;
};

class ShopScreen extends React.PureComponent<NavigationInjectedProps & Props, State> {
  user = firebase.auth().currentUser;
  previewSprite!: string;
  netInfo!: NetInfoSubscription;
  item!: Item;
  inventoryCache: Item[];

  constructor (props: Props | any) {
    super(props);
    this.state = { 
      items: Cache.shop.cache as Item[],
      inventoryItems: [],
      network: { connected: true, reachable: true },
      preview: {show: false, loading: true, error: false},
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
    this.netInfo();
  }

  private togglePreview = (url?: string) => {
    if (this.state.preview.show) {
      this.setState({ preview: {show: false, loading: true, error: false} });
    } else if (url) {
      this.setState({ preview: {...this.state.preview, loading: true} })
      Image.prefetch(url)
        .then(() => this.setState({ preview: {...this.state.preview, loading: false} }))
        .catch(err => this.setState({ preview: {...this.state.preview, error: true} }))
      this.previewSprite = url!;
      this.setState({ preview: {...this.state.preview, show: true} });
    } else {
      this.setState({ preview: {...this.state.preview, show: true, error: true} })
    }
  }

  private updateCache = () => {
    this.inventoryCache.push(this.item);
    Cache.inventory.update(this.inventoryCache);
    this.setState({ inventoryItems: [...this.state.inventoryItems, this.item.id] });
  }

  private buy = () => {
    if (this.item.spriteUrl) {
      Image.prefetch(this.item.spriteUrl)
        .then(_ => {
          firebase
            .database()
            .ref('users/' + this.user?.uid + '/inventory')
            .once('value')
            .then(async snapshot => {
              const inventory = snapshot.val();
              inventory.push(this.item.id)

              firebase
                .database()
                .ref('users/' + this.user?.uid)
                .update({
                  inventory: inventory,
                  gold: getCurrentGold() - this.item.info.buy
                })
                .then(_ => this.updateCache())
                .catch(_ => this.alert("Processing Error", "Something went wrong"));
            })
          this.alert("Purchase Successful", "You can now equip the item")
        })
        .catch(_ => {
          console.log("TEST issue in prefetch", _)
          this.alert("Processing Error", "Something went wrong")
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
          this.state.preview.show
            ? <View style={{
                width: "100%",
                height: "100%",
                backgroundColor: 'rgba(52, 52, 52, 0.8)',
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 99999,
              }}>
                <TouchableOpacity 
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    justifyContent: "center", 
                    alignItems: "center",
                  }}
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
});

export default withNavigation(ShopScreen);
export { Item }
