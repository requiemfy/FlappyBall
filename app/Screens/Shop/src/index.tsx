
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
import { Dimensions, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as Cache from '../../../src/cacheAssets'
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image';
import { getCurrentGold, setCurrentGold } from '../../Home/src';

interface Props { navigation: NavigationScreenProp<NavigationState, NavigationParams> & typeof CommonActions; }
interface State { 
  items: Item[];
  network: boolean;
  preview: boolean;
}

type Item = { 
  id: string;
  url: string;
  spriteUrl: string;
  info: any;
};

class ShopScreen extends React.PureComponent<NavigationInjectedProps & Props, State> {

  constructor (props: Props | any) {
    super(props);

    this.state = { 
      items: Cache.shop.cache,
      network: true,
      preview: false,
    };

    console.log("TEST shop screen items", this.state.items)
  }


  private togglePreview = () => {
    console.log("Please preview")
    if (this.state.preview) {
      this.setState({ preview: false });
    } else {
      this.setState({ preview: true });
    }
  }

  render() {
    return(
      <SafeAreaView style={styles.safeArea}>
        {
          this.state.preview 
            ? 
              <View style={{
                // flex: 1,
                // width: Dimensions.get("window").width,
                // height: Dimensions.get("window").height,
                // width: 100,
                // height: 100,
                width: "100%",
                height: "100%",
                backgroundColor: 'rgba(52, 52, 52, 0.8)',
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 99999,
              }}>
                <TouchableOpacity 
                  style={{ width: "100%", height: "100%" }}
                  onPress={() => this.togglePreview}>
                  
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
                    onPress={this.togglePreview}>
                      
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
                  <TouchableOpacity onPress={() => null}>
                    <Text style={{ color:"yellow", fontSize: 12, fontWeight: "bold" }}>BUY FOR {item.info.buy}</Text>
                  </TouchableOpacity>
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
