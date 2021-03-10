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
  backHandler!: NativeEventSubscription;

  constructor(props: Props | any) {
    super(props);
    const reference = firebase.storage().ref('item_images');
    this.listShopItems(reference).then(() => {
      console.log('Finished listing');
    });

    this.state = { 
      items: []
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

  backAction = () => {
    backOnlyOnce(this);
    return true;
  }

  listShopItems = (
    reference: firebase.storage.Reference
  ): Promise<any> => {
    return reference.list().then( async (result) => {
      let items: Item[] = [];
      await new Promise((resolve) => {
        result.items.forEach(async (ref) => {
          let url, itemName, description!: string;
          // set itemName
          itemName = ref.name.replace('.png', '');
          // set url
          url = await firebase.storage()
            .ref(ref.fullPath)
            .getDownloadURL();
          // set description
          await firebase
            .database()
            .ref('items/' + itemName + '/description')
            .once("value")
            .then(snapshot => {
              description = snapshot.val();
            });
          items = [
            ...items,
            {
              id: itemName,
              description: description,
              url: url,
            }
          ];
  
          if (result.items.indexOf(ref) === (result.items.length-1)) {
            resolve(null) 
          }
        })
      });
      console.log("items", items)
      this.setState({ items: items })
      return Promise.resolve();
    });
  }

  render() {
    return(
      <SafeAreaView style={styles.safeArea}>
        <FlatList 
          contentContainerStyle={{flex: 1, justifyContent: "center",}}
          data={this.state.items}
          renderItem={({ item }) => {
            return(
              <View style={styles.item}>
                <Text>{item.description}</Text>
              </View>
            )
          }}
          keyExtractor={(item: any) => item.name}
          numColumns={2}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "red",
  },
  item: {
    flex: 1,
    height: 100,
    backgroundColor: "green", 
    borderWidth: 1, 
    borderColor: "black",
  },
})
export default withNavigation(InventoryScreen);