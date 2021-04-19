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
import CachedImage from '../../../Components/CachedImage';
import FastImage from 'react-native-fast-image'

interface Props { navigation: NavigationScreenProp<NavigationState, NavigationParams> & typeof CommonActions; }
interface State { 
  items: Item[];
}

type Item = { id: string, description: string, url: string, spriteUrl: string };
type Active = { ballySprite: string, id: null | string };

let activeItem: Active = {
  ballySprite: Asset.fromModule(require('../../Game/assets/bally/bally.png')).uri,
  id: null
};

class InventoryScreen extends React.PureComponent<NavigationInjectedProps & Props, State> {
  navigation = this.props.navigation;
  user = firebase.auth().currentUser;
  backHandler!: NativeEventSubscription;

  constructor(props: Props | any) {
    super(props);
    this.state = { 
      items: JSON.parse(Cache.inventory.cache),
    };
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

  private selectItem = (id: string, sprite: string) => {
    // @note i can put this in async storage

    if (id === activeItem.id) {
      activeItem.ballySprite = Asset.fromModule(require('../../Game/assets/bally/bally.png')).uri;
      activeItem.id = null;
    } else {
      // activeItem.ballySprite = Asset.fromModule(require('../../Game/assets/bally/item-1.png')).uri;
      Image.prefetch(sprite);
      activeItem.ballySprite = sprite;
      activeItem.id = id;
    }
    
    this.forceUpdate();
  }

  render() {
    
    return(
      <SafeAreaView style={styles.safeArea}>
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
    height: 150,  
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#dfdddd59", 
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
