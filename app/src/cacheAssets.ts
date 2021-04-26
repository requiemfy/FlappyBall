// @refresh reset

import { Image } from 'react-native';
import { Asset } from 'expo-asset';
import * as Assets from './requireAssets';
import { firebase } from './firebase';
import CacheStorage from 'react-native-cache-storage';
import FastImage from 'react-native-fast-image';
import * as Shop from '../Screens/Shop/src';
import { loggedIn } from '../Screens/Login/src';

function cacheStaticImg(images: any[]) {
  return images.map(image => Asset.fromModule(image).downloadAsync());
}

async function loadAssetsAsync() {
  const imageAssets: any = cacheStaticImg(Assets.images);
  await Promise.all([...imageAssets]).catch(err => console.log("Load Assets Error:", err));
}

let cacheRetrieved = false, // this is useful to detect when the app is closed while LOG IN, therefore need to get cache ONCE
    retrieveInventory = false; // retrieve once = undefined, when = has url
async function loadUserAssetAsync() {
  shop.storage.getItem('fetch-again').then(async resolve => {
    if (!(resolve === "false")) {
      console.log("TEST cache - fetch again", resolve, typeof resolve)

      await new Promise((resolve, reject) => shop.fetch(resolve, reject))
        .then(resolve => console.log("CACHE SHOP RESOLVED:", resolve))
        .catch(reject => console.log("CACHE SHOP ERROR:", reject));

      if (retrieveInventory) {
        console.log("TEST prepare fetch inventory WTF")
        new Promise((resolve, reject) => inventory.fetch(resolve, reject))
          .then(resolve => console.log("CACHE INVENTORY RESOLVED:", resolve))
          .catch(err => console.log("CACHE INVENTORY ERROR:", err));
      }
      
    }
    else retrieveCache();
  })
  
}

function retrieveCache() {
  if(!cacheRetrieved && loggedIn){
    console.log("TEST cacheRetrieved")
    shop.storage.getItem('shop').then(resolve => shop.cache = JSON.parse(resolve!));
    inventory.storage.getItem('inventory').then(resolve => inventory.cache = JSON.parse(resolve!));
    cacheRetrieved = true;
  }
  
}

function getFileUrl(path: string) {
  return firebase
    .storage()
    .ref(path)
    .getDownloadURL()
    .catch(err => console.log("Getting download URL Error:", err));
}

// =======================================================================
// INVENTORY CACHING

const inventory = (() => {

  let cachedInventory: Shop.Item[] = [];
  const cacheStorage = new CacheStorage();
  
  const fetchInventory = (() => {

    // const getItemInfo = (itemName: string) => new Promise((resolve, reject) => {
    //   firebase
    //     .database()
    //     .ref('items/' + itemName)
    //     .once("value")
    //     .then(snapshot => resolve(snapshot.val()))
    //     .catch(err => reject(err));
    // });
  
    // const cacheInventory = async (inventoryResolve: any, inventoryReject: any) => {
      // const user = firebase.auth().currentUser;
  
      // firebase
      //   .database()
      //   .ref('users/' + user?.uid + '/inventory')
      //   .once('value')
      //   .then(snapshot => {
    //       if (!snapshot) return ;

    //       let allItemUri: any[] = [];

    //       new Promise((allResolve, allReject) => {
            
    //         const inventory: string[] = snapshot.val();
    //         let promiseAllItems: Promise<unknown>[] = [];

    //         inventory?.forEach(async (item: string) => {
    //           const promise = new Promise((itemResolve, itemReject) => {
    //             Promise.all([
    //               getFileUrl('item_images/' + item + '.png'),
    //               getFileUrl('item_sprites/' + item + '.png'),
    //               getItemInfo(item)
    //             ])
    //               .then(async arg => {
    //                 itemResolve({ 
    //                   id: item, 
    //                   url: arg[0], 
    //                   spriteUrl: arg[1], 
    //                   info: arg[2] 
    //                 });
    //                 allItemUri.push({ uri: arg[0] });
    //               })
    //               .catch(err => itemReject(err));
    //           });
    //           promiseAllItems.push(promise);

    //         });
    //         Promise.all(promiseAllItems).then(allItems => allResolve(allItems)).catch(err => allReject(err))
  
    //       })
    //       .then(allItems => {

    //         allItemUri[0]?.uri !== void 0 ? FastImage.preload(allItemUri) : null;
    //         const cacheItems = JSON.stringify(allItems);
    //         cacheStorage.setItem('inventory', cacheItems, 60 * 60 * 24)
    //           .then(() => { // @remind refactor
    //             cacheStorage.getItem("inventory").then(arg => {
    //               cachedInventory = JSON.parse(arg!);
    //               inventoryResolve("Success");
    //             })
    //           })
    //           .catch(err => inventoryReject(err));
  
    //       })
    //       .catch(err => inventoryReject(err));
  
    //     })
    //     .catch(err => inventoryReject(err));
    // }

    const cacheInventory = (resolve: any, reject: any) => {
      const user = firebase.auth().currentUser;

      firebase
        .database()
        .ref('users/' + user?.uid + '/inventory')
        .once('value')
        .then(snapshot => {
          if (loggedIn) {
            const inventory = snapshot.val() as string[], allItemUri: {uri: string}[] = [];
            shop.cache?.forEach(item => {
              if (inventory.includes(item.id)) {
                cachedInventory.push(item);
                allItemUri.push({ uri: item.url })
              }
            });
  
            allItemUri[0]?.uri !== void 0 ? FastImage.preload(allItemUri) : null;
            cacheStorage.setItem('inventory', JSON.stringify(cachedInventory), 60 * 60 * 24);

            retrieveInventory = false
            resolve("success")
          }
        })
        .catch(err => reject(err));
    }
  
    return async (resolve: any, reject: any) => {
      console.log("CONSOLE: Fetching inventory...")

      // cacheStorage.getItem("inventory")
      //   .then(arg => {
      //     console.log("CONSOLE: CURRENT INVENTORY", typeof arg, arg)
      //     if (arg && JSON.parse(arg!).length) {
      //       cachedInventory = JSON.parse(arg);
      //       resolve("Inventory Already Cached");
      //     } else {
      //       cacheInventory(resolve, reject);
      //     }
      //   })
      //   .catch(err => reject(err));

      cacheInventory(resolve, reject);
    }
  })();
  
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
  // purpose of this is not to rely on get method of cache
  let cachedShop: Shop.Item[] | undefined; // @note this is needed trust me, because local let items should be cleared

  cacheStorage.setItem('fetch-again', 'true', 60 * 60 * 24);

  const iterateFetch = async (config: {
    list: string[],
    from: keyof { database: string, storage: string },
    database?: any
  }, resolve: any, reject: any) => {

    let allItemUri: any[] = [];

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
                resolve[1] || (config.from === "database") ? null : itemReject("rejected since undefined url")
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
      
        // if ((allItemUri[0]?.uri !== void 0) || (config.from === "database")) {
        //   cachedShop = allItems as Shop.Item[];
        //   const stringShop = JSON.stringify(allItems);
        //   cacheStorage.setItem('shop', stringShop, 60 * 60 * 24).catch(err => reject(err));
        //   resolve("success");
        // } else {
        //   reject("Getting URL error");
        // }

        cachedShop = allItems as Shop.Item[];
        cacheStorage.setItem('shop', JSON.stringify(allItems), 60 * 60 * 24).catch(err => reject(err));

        if (allItemUri[0]?.uri !== void 0) {
          cacheStorage.setItem('fetch-again', 'false', 60 * 60 * 24);
          retrieveInventory = true;
          resolve("success");
        } else if (config.from === "database") {
          resolve("success undefined url")
        } else {
          reject("Getting URL error");
        }
      } else {
        reject("User not logged in")
      }
    })
    .catch(err => reject(err));
  }

  const fetchShop = async (resolve: any, reject: any) => {

    // new Promise((resolve, reject) => {
    //   firebase
    //     .database()
    //     .ref('items/')
    //     .once('value')
    //     .then(snapshot => resolve(snapshot.val()))
    //     .catch(err => reject(err))
    // })
    
    firebase
      .database()
      .ref('items/')
      .once('value')
      .then(async (snapshot) => {
        if (loggedIn) {

          const obj = snapshot.val() as any;
          const itemNames = Object.keys(obj);
          
          cacheStorage.getItem('shop').then(async (arg) => {

            console.log("TEST trying to fetch undefined", arg)
            if (!arg) {
              console.log("TEST fetch undefined")
              await new Promise((resolve, reject) => {
                iterateFetch({
                  list: itemNames,
                  from: "database",
                  database: obj
                }, resolve, reject)
              })
              .then(res => {
                console.log("TEST set cacheRetrieved = true");
                retrieveInventory = true;
                cacheRetrieved = true;
                resolve(res)
              })
              .catch(err => reject(err))
            } else {
              // cacheStorage.getItem('shop').then(arg => arg ? cachedShop = JSON.parse(arg) : null); @remind lcear
              console.log("TEST in fetch again retrieveCache", cacheRetrieved)
              retrieveCache();
            }

            await new Promise((resolve, reject) => {
              iterateFetch({
                list: itemNames,
                from: "storage",
                database: obj
              }, resolve, reject)
            }).catch(err => reject(err))

            resolve("succeed");
          })
        }
      })
      .catch(err => reject(err))
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