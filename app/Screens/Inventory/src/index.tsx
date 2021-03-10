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

interface Props { navigation: NavigationScreenProp<NavigationState, NavigationParams> & typeof CommonActions; }
interface State { 
  items: Item[]
}

type Item = {id: string, description: string, url: string};

class InventoryScreen extends React.PureComponent<NavigationInjectedProps & Props, State> {
  navigation = this.props.navigation;
  user = firebase.auth().currentUser;
  backHandler!: NativeEventSubscription;

  constructor(props: Props | any) {
    super(props);
    this.state = { 
      items: []
    };
    this.listInventoryItems();
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


  // in constructor:::
  // const reference = firebase.storage().ref('item_images');
  // this.listInventory(reference).then(() => {
  //   console.log('Finished listing');
  // });


  // listInventory = (
  //   reference: firebase.storage.Reference
  // ): Promise<any> => {
  //   return reference.list().then( async (result) => {
  //     let items: Item[] = [];

      // await new Promise((resolve) => {
      //   result.items.forEach(async (ref) => {
      //     let url, itemName, description!: string;
      //     // set itemName
      //     itemName = ref.name.replace('.png', '');
      //     // set url
      //     url = await firebase.storage()
      //       .ref(ref.fullPath)
      //       .getDownloadURL();
      //     // set description
      //     await firebase
      //       .database()
      //       .ref('items/' + itemName + '/description')
      //       .once("value")
      //       .then(snapshot => {
      //         description = snapshot.val();
      //       });
      //     items = [
      //       ...items,
      //       {
      //         id: itemName,
      //         description: description,
      //         url: url,
      //       }
      //     ];
  
      //     if (result.items.indexOf(ref) === (result.items.length-1)) {
      //       resolve(null) 
      //     }
      //   })
      // });

  //     console.log("items", items)
  //     this.setState({ items: items })
  //     return Promise.resolve();
  //   });
  // }


  private listInventoryItems = async () => {
    let items: Item[] = [];
    const getItemDescription = (itemName: string) => new Promise((resolve, reject) => {
      firebase
        .database()
        .ref('items/' + itemName + '/description')
        .once("value")
        .then(snapshot => resolve(snapshot.val()))
        .catch(err => reject(err));
    });
    const getItemUrl = (itemName: string) => firebase
      .storage()
      .ref('item_images/' + itemName + '.png')
      .getDownloadURL();
    firebase
      .database()
      // LVhjESKOFUZdbmgT9AF6JyEog0B2
      .ref('users/' + this.user?.uid + '/inventory')
      .once('value')
      .then(snapshot => {
        new Promise((resolve, reject) => {
          const inventory: string[] = snapshot.val();
          let promises: Promise<unknown>[] = [];
          inventory?.forEach(async (item: string) => {
            const promise = new Promise((resolve, reject) => {
              Promise.all([getItemDescription(item), getItemUrl(item)])
                .then(arg => resolve({ id: item, description: arg[0], url: arg[1] }))
                .catch(err => reject(err));
            });
            promises.push(promise);
          });
          Promise.all(promises).then(arg => resolve(arg)).catch(err => reject(err))
        })
        .then(items => {
          const itemsArr = items as Item[];
          this.setState({ items: itemsArr });
        })
        .catch(err => console.log(err));
      });
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
                    onPress={() => console.log(item.id)}>
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