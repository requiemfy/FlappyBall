// @refresh reset

import { Asset } from 'expo-asset';
import * as Assets from './requireAssets';
import { firebase } from './firebase';
import CacheStorage from 'react-native-cache-storage';
import FastImage from 'react-native-fast-image';
import * as Shop from '../Screens/Shop/src';

function cacheStaticImg(images: any[]) {
  return images.map(image => Asset.fromModule(image).downloadAsync());
}

async function loadAssetsAsync() {
  const imageAssets: any = cacheStaticImg(Assets.images);
  await Promise.all([...imageAssets]).catch(err => console.log("cache: loadAssetsAsync Error:", err));
}

let cacheAssetRetrieved = false; // this is useful to detect when the app is closed while LOG IN, therefore need to get cache ONCE

async function loadUserAsync(resolve: any, reject: any) {
  await user.fetch(resolve, reject);

  shop.storage.getItem('fetch-again').then(async resolve => {
    if (!(resolve === "false")) {
      console.log("cache: fetch urls again", resolve, typeof resolve)
      new Promise((resolve, reject) => shop.fetch(resolve, reject))
        .then(resolve => console.log("== cache: CACHE SHOP RESOLVED -", resolve))
        .catch(reject => console.log("== cache: CACHE SHOP ERROR -", reject));
    }
    else {
      console.log("cache: DONT fetch urls again, resolve status:", resolve)
      retrieveAssetCache();
    }
  })
}

function retrieveAssetCache() {
  if(!cacheAssetRetrieved){
    shop.storage.getItem('shop').then(resolve => shop.data = JSON.parse(resolve!));
    inventory.storage.getItem('inventory').then(resolve => inventory.data = JSON.parse(resolve!));
    cacheAssetRetrieved = true;
  }
  console.log("== cache: cacheAssetRetrieved", cacheAssetRetrieved)
}

function getFileUrl(path: string) {
  return firebase
    .storage()
    .ref(path)
    .getDownloadURL()
    .catch(err => console.log("== cache: getFileUrl Error ", err));
}

// =======================================================================
// INVENTORY CACHING

const inventory = (() => {
  let inventoryCache: Shop.Item[] = [];
  // cancelRequest: () => any = () => null; // @remind clear
  const cacheStorage = new CacheStorage();

  // const request = async (resolve: any, reject: any) => { // @remind clear
  const fetchInventory = () => {
    console.log("== cache: Fetching inventory...");
    // const user = firebase.auth().currentUser; // @remind clear
    // let loggedIn = true;

    // firebase
    //   .database()
    //   .ref('users/' + user?.uid + '/inventory')
    //   .once('value')
    //   .then(snapshot => {
        // if (loggedIn) {
        //   const inventory = snapshot.val() as string[], allItemUri: {uri: string}[] = [];
        //   inventoryCache = [];
        //   shop.cache?.forEach(item => {
        //     if (inventory?.includes(item.id)) {
        //       inventoryCache.push(item);
        //       allItemUri.push({ uri: item.url });
        //     }
        //   });
        //   allItemUri[0]?.uri !== void 0 ? FastImage.preload(allItemUri) : null;
        //   cacheStorage.setItem('inventory', JSON.stringify(inventoryCache), 60 * 60 * 24);
        //   resolve("success retrieve invent")
        // }
        // else reject("User not logged-in")
    //   })
    //   .catch(err => reject(err));

      const inventory = user.data?.inventory, allItemUri: {uri: string}[] = [];
      inventoryCache = [];
      shop.data?.forEach(item => {
        if (inventory?.includes(item.id)) {
          inventoryCache.push(item);
          allItemUri.push({ uri: item.url });
        }
      });
      allItemUri[0]?.uri !== void 0 ? FastImage.preload(allItemUri) : null;
      cacheStorage.setItem('inventory', JSON.stringify(inventoryCache), 60 * 60 * 24);
      console.log("== cache: CACHE INVENTORY DONE <3");
  }
  
  // const fetchInventory = () => { // @remind clear
  //   console.log("== cache: going to fetch inventory")
  //   new Promise((resolve, reject) => request(resolve, reject))
  //     .then(resolve => console.log("== cache: CACHE INVENTORY RESOLVED:", resolve))
  //       .catch(err => console.log("== cache: CACHE INVENTORY ERROR:", err));
  // }

  return {
    fetch: fetchInventory,
    update: (items: Shop.Item[]) => {
      inventoryCache = items;
      cacheStorage.setItem('inventory', JSON.stringify(items), 60 * 60 * 24)
    },
    get data() {return inventoryCache;},
    set data(items: Shop.Item[]) {
      inventoryCache = items;
    },
    storage: cacheStorage,
    clear: () => {
      cacheStorage.setItem('inventory', '', 1);
      cacheStorage.clear();
      inventoryCache = [];
    }
  }
})();

// INVENTORY CACHING
// =======================================================================
// =======================================================================
// SHOP CACHING

const shop = (() => {
  const cacheStorage = new CacheStorage();
  // purpose of shopCache is not to rely on get method of cache
  // @note this is needed trust me, because local let items should be cleared
  let 
    shopCache: Shop.Item[] | undefined, 
    cancelFetchShop: () => any = () => null,
    cancelIterate: () => any = () => null; 

  const iterateFetch = async (config: {
    list: string[],
    from: keyof { database: string, storage: string },
    database?: any
  }, resolve: any, reject: any) => {
    let allItemUri: any[] = [], loggedIn = true;
    new Promise((allResolve, allReject) => {
      let promiseAllItems: Promise<unknown>[] = [];
      config.list.forEach(async (item: any) => {
        const promise = new Promise((itemResolve, itemReject) => {
          Promise.all([
            config.database[item],
            config.from === "storage" ? getFileUrl('item_images/' + item + '.png') : void 0,
            config.from === "storage" ? getFileUrl('item_sprites/' + item + '.png') : void 0
          ]).then(async resolve => {
              if (loggedIn) {
                (resolve[1] || (config.from === "database")) ? null : itemReject("rejected since undefined url")
                itemResolve({ 
                  id: item,
                  info: resolve[0],
                  url: resolve[1],
                  spriteUrl: resolve[2]
                });
                allItemUri.push({ uri: resolve[1] });
              } else {
                itemReject("User not logged in")
              }
            })
            .catch(err => itemReject(err));
        });
        promiseAllItems.push(promise);
      });
      Promise.all(promiseAllItems).then(allItems => allResolve(allItems)).catch(err => allReject(err))
    })
    .then(allItems => {
      if (loggedIn) {
        allItemUri[0]?.uri !== void 0 ? FastImage.preload(allItemUri) : null;
        shopCache = allItems as Shop.Item[];
        cacheStorage.setItem('shop', JSON.stringify(allItems), 60 * 60 * 24).catch(err => reject(err));
        if (allItemUri[0]?.uri !== void 0) {
          cacheStorage.setItem('fetch-again', 'false', 60 * 60 * 24);
          inventory.fetch();
          resolve("Success getting urls");
        } else if (config.from === "database") {
          resolve("Success undefined urls")
        } else {
          reject("Getting urls error");
        }
      } else {
        reject("User not logged in")
      }
    })
    .catch(err => reject(err));
    cancelIterate = () => loggedIn = false;
  }

  const fetchShop = async (resolve: any, reject: any) => {
    let loggedIn = true;
    firebase
      .database()
      .ref('items/')
      .once('value')
      .then(async (snapshot) => {
        console.log("== cache: logged in", loggedIn)
        if (loggedIn) {
          const obj = snapshot.val() as any;
          const itemNames = Object.keys(obj);
          cacheStorage.getItem('shop').then(async (arg) => {
            console.log("== cache: trying to fetch undefined urls first", arg)
            if (!arg) {
              console.log("== cache: fetching undefined urls")
              await new Promise((resolve, reject) => {
                iterateFetch({
                  list: itemNames,
                  from: "database",
                  database: obj
                }, resolve, reject);
              }).then(res => {
                  inventory.fetch();
                  resolve(res);
                })
                .catch(err => reject(err))
            } else {
              console.log("== cache: don't fetch urls again, just get from cache");
              retrieveAssetCache();
            }
            // resolve or reject of this won't take effect, because of top promise FIRST
            new Promise((resolve, reject) => {
              iterateFetch({
                list: itemNames,
                from: "storage",
                database: obj
              }, resolve, reject);
            }).then(res => {
                console.log("== cache: getting url resolve:", res);
                resolve(res);
              })
              .catch(err => {
                console.log("== cache: getting url reject:", err);
                reject(err);
              });
          })
        }
        else reject("User NOT logged-in");
      })
      .catch(err => reject(err));
    
    cancelFetchShop = () => loggedIn = false;
  }

  return {
    fetch: fetchShop,
    get data() {return shopCache},
    set data(val: Shop.Item[] | undefined) {
      shopCache = val;
    },
    storage: cacheStorage,
    clear: () => {
      cancelIterate();
      cancelFetchShop();
      cacheStorage.setItem('shop', '', 1);
      cacheStorage.setItem('fetch-again', '', 1);
      cacheStorage.clear();
      shopCache = [];
    }
  }
})();

// CACHE SHOP
// =======================================================================

const user = (() => {
  const cacheStorage = new CacheStorage();
  let userCache: {codeName: string, record: number, inventory?: string[], gold: number} | null;

  const request = (resolve: any, reject: any) => {
    const user = firebase.auth().currentUser;
    console.log("== cache: fetching firebase for user data...");
    firebase.database().ref('users/' + user?.uid)
      .once('value')
      .then(snapshot => {
        userCache = snapshot.val();
        cacheStorage.setItem('current-user', JSON.stringify(userCache), 0);
        resolve(userCache);
        console.log("== cache: success fetching user data, done caching");
      })
      .catch(err => {
        reject(err);
        console.log("== cache: failed fetching user data");
      });
  }

  const fetchUser = async (resolve: any, reject: any) => {
    console.log('== cache: checking if let static user var has value');
    if (userCache) {
      resolve(userCache);
      console.log("== cache: static user var has value, use it instead (of cache)");
      return;
    } else {
      console.log("== cache: NO value static user var, try to use cache")
    }
    console.log('== cache: checking if user data has cache');
    cacheStorage.getItem('current-user').then(arg => {
      if (arg) {
        console.log('== cache: has cache of user data, retreived', arg);
        userCache = JSON.parse(arg);
        resolve(userCache);
      } else {
        console.log('== cache: NO cache of user data, fetch it');
        request(resolve, reject);
      }
    });
  }

  return {
    fetch: fetchUser,
    
    get data() {return userCache;},

    update: (val: {record?: number, gold?: number, inventory?: string[]}) => {
      // val.gold ? userCache!.gold = val.gold : null; @remind
      // val.record ? userCache!.record = val.record : null;
      // val.inventory ? userCache!.inventory = val.inventory : null;
      userCache = { ...userCache!, ...val };
      cacheStorage.setItem('current-user', JSON.stringify(userCache), 0);
    },
    
    storage: cacheStorage,
    
    clear: () => {
      cacheStorage.setItem('current-user', '', 1);
      cacheStorage.clear();
      userCache = null;
    }
  }
})()

export { 
  loadAssetsAsync, 
  loadUserAsync, 
  inventory,
  shop,
  user,
}