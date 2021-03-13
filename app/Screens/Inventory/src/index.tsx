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

  constructor(props: Props | any) {
    super(props);
    this.state = { 
      items: JSON.parse(Cache.inventory.cache),
    };

    console.log("this.state.items", this.state.items)
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

  private setSprite = (item: string) => {
    ballySprite = item;
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