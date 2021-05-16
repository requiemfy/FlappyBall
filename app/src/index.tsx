// if (!__DEV__) {
//   console.log = () => null;
// }
console.log = () => null;

import * as React from 'react';
import { firebase } from '../src/firebase';
import AppLoading from 'expo-app-loading';
import MainStackScreen from '../Navigation/src';
import * as Cache from './cache';
import { LogBox } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { alert, homeRef, inventoryRef, shopRef } from './helpers';

LogBox.ignoreLogs(['Setting a timer']);

export default function Game() {
  const [route, setRoute] = React.useState("Login");
  const [loadingAsset, setLoadingAsset] = React.useState(true);
  const [loadingUser, setloadingUser] = React.useState(true);
  const unsavedData = Cache.user.pending;
  let network = {current: true, trigger: true};
  let hasUser = false;

  React.useEffect(() => {
    console.log("App index: MOUNT");
    const authListenerUnsub = firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
      console.log("== app index: trying to check if there's current user");
      if (user) {
        hasUser = true;
        setRoute("Home");
        console.log("== app index: current user id", user.email);
      } else {
        hasUser = false
        console.log("== app index: NO user", user);
      }
      setloadingUser(false);
    });
    const netInfoUnsub = NetInfo.addEventListener(state => {
      network.current = Boolean(state.isConnected && state.isInternetReachable);
      console.log("== app index: network status", network);
      if (network.current && network.trigger) {
        network.trigger = false
        unsavedData.storage.getItem('unsaved').then(resolve => {
          if (resolve) {
            const users = JSON.parse(resolve);
            let update = {};
            console.log("== app index: Trying to save detected unsaved users data", users);
            Object.keys(users).forEach(user => {
              let allPath = {
                [user + "/gold"]: users[user].gold,
              }
              if (users[user].record) allPath[user + "/record"] = users[user].record;
              update = {...update, ...allPath};
            })
            console.log("== app index: All data path for update", update)
            firebase.database().ref('/users').update(update)
              .then(_ => {
                console.log("== app index: Success saving unsaved data, outdated cache cleared");
                unsavedData.storage.setItem('unsaved', '', 1);
                unsavedData.storage.clear();
                if (!hasUser) return console.log("== app index: NO user, no need to update state")
                updateUserState();
              })
              .catch(_ => console.log("== app index: Failed unsaved data"));
          } else {
            console.log("== app index: No detected unsaved data")
          }
        });
      } else if (!network.current) {
        network.trigger = true;
      }
    });
    return () => {
      // i know this is nonsense
      console.log("== app index: UN-MOUNT");
      authListenerUnsub();
      netInfoUnsub();
    }
  }, []);

  if (loadingAsset || loadingUser) {
    return (
      <AppLoading 
        startAsync={() => Cache.loadAssetsAsync()}
        onFinish={() => {
          setLoadingAsset(false);
          console.log("== app index: finished loading asset");
        }}
        onError={console.log}
      />
    )
  }

  console.log("== app index: initial route", route)
  return <MainStackScreen initRoute={route}/>
}

function updateUserState() {
  console.log("== app index: Trying to fetch updated user state data");
  Cache.user.clear();
  new Promise((resolve, reject) => Cache.user.fetch(resolve, reject))
    .then(res => {
      if (!res) return console.log("== app index: Resolve is not valid");
      else console.log("== app index: Updated data resolve", res)
      const user = res as any;
      homeRef()?.safeSetState({ user: {
        ...homeRef()?.state.user,
        codeName: user.codeName,
        record: user.record,
      }});
      inventoryRef()?.safeSetState({gold: user.gold});
      shopRef()?.safeSetState({gold: user.gold});
      alert("DATA UPDATED", "Offline data was saved");
      console.log("== app index: Success to fetch updated user data");
    })
    .catch(err => console.log("== app index: Error fetching updated user data", err));
}