if (!__DEV__) {
  console.log = () => null;
}

import * as React from 'react';
import { firebase } from '../src/firebase';
import AppLoading from 'expo-app-loading';
import MainStackScreen from '../Navigation/src';
import { loadAssetsAsync } from './cacheAssets';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['Setting a timer']);

export default function Game() {
  const [route, setRoute] = React.useState("Login");
  const [loadingAsset, setLoadingAsset] = React.useState(true);
  const [loadingUser, setloadingUser] = React.useState(true);

  React.useEffect(() => {
    return firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
      console.log("app index: trying to check if there's current user");
      if (user) {
        setRoute("Home");
        console.log("== app index: current user id", user.email);
      } else {
        console.log("== app index: NO user", user);
      }
      setloadingUser(false);
      console.log("== app index: finished loading user");
    });
  }, []);

  if (loadingAsset || loadingUser) {
    return (
      <AppLoading 
        startAsync={() => loadAssetsAsync()}
        onFinish={() => {
          setLoadingAsset(false);
          console.log("== app index: finished loading user");
        }}
        onError={console.log}
      />
    )
  }

  console.log("== app index: initial route", route)
  return <MainStackScreen initRoute={route}/>
}