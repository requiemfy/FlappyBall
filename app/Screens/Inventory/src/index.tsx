// Lists all user's purchased item in the shop

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

interface Props { navigation: NavigationScreenProp<NavigationState, NavigationParams> & typeof CommonActions; }
interface State { 
  items: Item[];
}

type Item = {id: string, description: string, url: string};

class InventoryScreen extends React.PureComponent<NavigationInjectedProps & Props, State> {
  navigation = this.props.navigation;
  user = firebase.auth().currentUser;
  backHandler!: NativeEventSubscription;
  // cacheStorage = new CacheStorage();

  constructor(props: Props | any) {
    super(props);
    this.state = { 
      items: JSON.parse(Cache.inventory.items),
    };
    // this.listInventory();

    // const getCache = this.cacheStorage.getItem("inventory")
      // .then(arg => {
      //   console.log("getting inventory", arg)
      //   this.cacheStorage.setItem("inventory", "new set").then(() => {
      //     console.log("setted item")
      //     this.cacheStorage.getItem("inventory")
      //       .then(arg => {
      //         console.log("getting inventory new val", arg)
      //       })
      //   })
      // })
  }

  componentDidMount() {
    console.log("Inventorys MOUNT");
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.backAction);
  }

  componentWillUnmount() {
    console.log("Inventorys UN-MOUNT")
    this.backHandler.remove();
  }

  private backAction = () => {
    backOnlyOnce(this);
    return true;
  }

  // check cache storage if items already exist, then don't fetch again
  // private listInventory = () => {
  //   // this.cacheStorage.getItem("inventory")
  //   //   .then(arg => {
  //   //     console.log("INVENTORY", arg)
  //   //     if (arg) {
  //   //       this.setState({ items: JSON.parse(arg) });
  //   //     } else {
  //   //       // this.fetchInventory();
  //   //     }
  //   //   })
  // }


  // private fetchInventory = (() => {
  //   const getItemDescription = (itemName: string) => new Promise((resolve, reject) => {
  //     firebase
  //       .database()
  //       .ref('items/' + itemName + '/description')
  //       .once("value")
  //       .then(snapshot => resolve(snapshot.val()))
  //       .catch(err => reject(err));
  //   });

  //   const getItemUrl = (itemName: string) => firebase
  //     .storage()
  //     .ref('item_images/' + itemName + '.png')
  //     .getDownloadURL();

  //   return async () => {
  //     let items: Item[] = [];
  //     firebase
  //       .database()
  //       // LVhjESKOFUZdbmgT9AF6JyEog0B2
  //       .ref('users/' + this.user?.uid + '/inventory')
  //       .once('value')
  //       .then(snapshot => {
  //         new Promise((resolve, reject) => {
  //           const inventory: string[] = snapshot.val();
  //           let promises: Promise<unknown>[] = [];
  //           inventory?.forEach(async (item: string) => {
  //             const promise = new Promise((resolve, reject) => {
  //               Promise.all([getItemDescription(item), getItemUrl(item)])
  //                 .then(async arg => {
  
  //                   // @remind fail
  //                   // const image: any = cacheImage([arg[1]]);
  //                   // await Promise.all([...image]);
  
  //                   // await Image.prefetch(arg[1])
  //                   //   .then(async () => {
  //                   //     const gg = await Image.queryCache!([arg[1] as string])
  //                   //       .then(arg => console.log("Query fetch", arg));
  //                   //   });
  
  //                   // Image.queryCache!(["https://gg.com"])
  //                   //   .then(arg => {
  //                   //     if (!Object.keys(arg).length) {
  //                   //       Image.prefetch(arg[1]);
  //                   //     }
  //                   //   })
  
  //                   resolve({ id: item, description: arg[0], url: arg[1] })
  //                 })
  //                 .catch(err => reject(err));
  //             });
  //             promises.push(promise);
  //           });
  //           Promise.all(promises).then(arg => resolve(arg)).catch(err => reject(err))
  //         })
  //         .then(items => {
  //           const 
  //             itemsArr = items as Item[],
  //             cacheItem = JSON.stringify(itemsArr);
  //           this.cacheStorage.setItem('inventory', cacheItem, 60);
  //           this.setState({ items: itemsArr });
  //         })
  //         .catch(err => console.log(err));
  //       });
  //   }
  // })()

  private setSprite = (item: string) => {
    ballySprite = item;
  }

  render() {
    
    return(
      <SafeAreaView style={styles.safeArea}>
        {
          // this.state.items.length
          true
          ? <FlatList 
              contentContainerStyle={styles.flatlist}
              data={this.state.items}
              renderItem={({ item }) => { return (
                <View style={styles.item}>
                  <TouchableOpacity 
                    style={styles.touchable} 
                    onPress={() => this.setSprite(item.id)}>
                      
                    <Image source={{uri: item.url}} style={{resizeMode: "contain", width: 100, height: 100}}/>

                    <Text>{item.description}</Text>
                  </TouchableOpacity>
                </View>
              )}}
              keyExtractor={(item: any) => item.name}
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

let ballySprite: string | null = null;
function getBallySprite() {
  return ballySprite;
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
    height: 150,  
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
})
export default withNavigation(InventoryScreen);
export { getBallySprite };