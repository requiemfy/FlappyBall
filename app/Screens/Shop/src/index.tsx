
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
import { View } from 'react-native';


interface Props { navigation: NavigationScreenProp<NavigationState, NavigationParams> & typeof CommonActions; }
interface State { 
  items: Item[];
  network: boolean;
}

type Item = { 
  id: string;
  url: string;
  description: string;
};


const reference = firebase.storage().ref('item_images')
let shopItems = [];


class ShopScreen extends React.PureComponent<NavigationInjectedProps & Props, State> {

  constructor (props: Props | any) {
    super(props);

    // this.listShopItems(reference).then(() => {
    //   console.log('Finished listing');
    // });
  }


  render() {
    return(
      <View style={{ backgroundColor: "red", width: "100%", height: "100%" }}>
      </View>
    )
  }

}


function listShopItems(
  reference: firebase.storage.Reference
): Promise<any> {
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

        items.push({
          id: itemName,
          description: description,
          url: url,
        });

        if (result.items.indexOf(ref) === (result.items.length-1)) {
          resolve(null) 
        }
      })
    });

    console.log("items", items)
    shopItems = items;
    return Promise.resolve();
  });
}


export default withNavigation(ShopScreen);
