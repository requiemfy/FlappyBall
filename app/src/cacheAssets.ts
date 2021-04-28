// @refresh reset

import { Asset } from 'expo-asset';
import * as Assets from './requireAssets';
import { firebase } from './firebase';
import CacheStorage from 'react-native-cache-storage';
import FastImage from 'react-native-fast-image';
import * as Shop from '../Screens/Shop/src';
// import { loggedIn } from '../Screens/Login/src';

function cacheStaticImg(images: any[]) {
  return images.map(image => Asset.fromModule(image).downloadAsync());
}

async function loadAssetsAsync() {
  const imageAssets: any = cacheStaticImg(Assets.images);
  await Promise.all([...imageAssets]).catch(err => console.log("cacheAssets: loadAssetsAsync Error:", err));
}

let cacheRetrieved = false; // this is useful to detect when the app is closed while LOG IN, therefore need to get cache ONCE

async function loadUserAssetAsync() {
  shop.storage.getItem('fetch-again').then(async resolve => {
    if (!(resolve === "false")) {
      console.log("cacheAssets: fetch urls again", resolve, typeof resolve)
      new Promise((resolve, reject) => shop.fetch(resolve, reject))
        .then(resolve => console.log("== cacheAssets: CACHE SHOP RESOLVED -", resolve))
        .catch(reject => console.log("== cacheAssets: CACHE SHOP ERROR -", reject));
    }
    else {
      console.log("cacheAssets: DONT fetch urls again")
      retrieveCache();
    }
  })
}

function retrieveCache() {
  if(!cacheRetrieved){
    shop.storage.getItem('shop').then(resolve => shop.cache = JSON.parse(resolve!));
    inventory.storage.getItem('inventory').then(resolve => inventory.cache = JSON.parse(resolve!));
    cacheRetrieved = true;
  }
  console.log("== cacheAssets: cacheRetrieved", cacheRetrieved)
}

function getFileUrl(path: string) {
  return firebase
    .storage()
    .ref(path)
    .getDownloadURL()
    .catch(err => console.log("== cacheAssets: getFileUrl Error ", err));
}

// =======================================================================
// INVENTORY CACHING

const inventory = (() => {
  let cachedInventory: Shop.Item[] = [], cancelRequest: () => any = () => null;
  const cacheStorage = new CacheStorage();

  const request = async (resolve: any, reject: any) => {
    console.log("== cacheAssets: Fetching inventory...");
    const user = firebase.auth().currentUser;
    let loggedIn = true;
    firebase
      .database()
      .ref('users/' + user?.uid + '/inventory')
      .once('value')
      .then(snapshot => {
        if (loggedIn) {
          const inventory = snapshot.val() as string[], allItemUri: {uri: string}[] = [];
          cachedInventory = [];
          shop.cache?.forEach(item => {
            if (inventory?.includes(item.id)) {
              cachedInventory.push(item);
              allItemUri.push({ uri: item.url });
            }
          });
          allItemUri[0]?.uri !== void 0 ? FastImage.preload(allItemUri) : null;
          cacheStorage.setItem('inventory', JSON.stringify(cachedInventory), 60 * 60 * 24);
          resolve("success retrieve invent")
        }
        else reject("User not logged-in")
      })
      .catch(err => reject(err));
    cancelRequest = () => loggedIn = false;
  }
  
  const fetchInventory = () => {
    console.log("== cacheAssets: going to fetch inventory")
    new Promise((resolve, reject) => request(resolve, reject))
      .then(resolve => console.log("== cacheAssets: CACHE INVENTORY RESOLVED:", resolve))
        .catch(err => console.log("== cacheAssets: CACHE INVENTORY ERROR:", err));
  }

  return {
    fetch: fetchInventory,
    update: (item: Shop.Item[]) => {
      cachedInventory = item;
      cacheStorage.setItem('inventory', JSON.stringify(item), 60 * 60 * 24)
    },
    get cache() {
      return cachedInventory;
    },
    set cache(val: Shop.Item[]) {
      cachedInventory = val;
    },
    storage: cacheStorage,
    clear: () => {
      cancelRequest();
      cacheStorage.setItem('shop', '');
      cacheStorage.clear();
      cachedInventory = [];
    }
  }
})();

// INVENTORY CACHING
// =======================================================================
// =======================================================================
// SHOP CACHING

const shop = (() => {
  const cacheStorage = new CacheStorage();
  // purpose of cachedShop is not to rely on get method of cache
  // @note this is needed trust me, because local let items should be cleared
  let 
    cachedShop: Shop.Item[] | undefined, 
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
        cachedShop = allItems as Shop.Item[];
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
        console.log("== cacheAssets: logged in", loggedIn)
        if (loggedIn) {
          const obj = snapshot.val() as any;
          const itemNames = Object.keys(obj);
          cacheStorage.getItem('shop').then(async (arg) => {
            console.log("== cacheAssets: trying to fetch undefined urls first", arg)
            if (!arg) {
              console.log("== cacheAssets: fetching undefined urls")
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
              console.log("== cacheAssets: don't fetch urls again, just get from cache");
              retrieveCache();
            }
            // resolve or reject of this won't take effect, because of top promise FIRST
            new Promise((resolve, reject) => {
              iterateFetch({
                list: itemNames,
                from: "storage",
                database: obj
              }, resolve, reject);
            }).then(res => {
                console.log("== cacheAssets: getting url resolve:", res);
                resolve(res);
              })
              .catch(err => {
                console.log("== cacheAssets: getting url reject:", err);
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
    get cache() {
      return cachedShop;
    },
    set cache(val: Shop.Item[] | undefined) {
      cachedShop = val;
    },
    storage: cacheStorage,
    clear: () => {
      cancelIterate();
      cancelFetchShop();
      cacheStorage.setItem('shop', '');
      cacheStorage.clear();
      cachedShop = [];
    }
  }
})();

// CACHE SHOP
// =======================================================================

export { 
  loadAssetsAsync, 
  loadUserAssetAsync, 
  inventory,
  shop,
}