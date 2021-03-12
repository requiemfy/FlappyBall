import * as React from 'react';
import * as Firebase from './firebase';
import AppLoading from 'expo-app-loading';
import MainStackScreen from '../Navigation/src';
import { loadAssetsAsync } from './cacheAssets';


export default function Game() {
  const [isLoading, setIsLoading] = React.useState(true);

  // if (isLoading) {
  //   return (
  //     <AppLoading 
  //       startAsync={() => loadAssetsAsync()}
  //       onFinish={() => setIsLoading(false)}
  //       onError={console.log}
  //     />
  //   )
  // }

  return (
    <MainStackScreen />
  );
}

