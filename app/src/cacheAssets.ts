import { Image } from 'react-native';
import { Asset } from 'expo-asset';
import * as Assets from './requireAssets';
import { firebase } from './firebase';
import CacheStorage from 'react-native-cache-storage';
import FastImage from 'react-native-fast-image';

function cacheStaticImg(images: any[]) {
  return images.map(image => Asset.fromModule(image).downloadAsync());
}

async function loadAssetsAsync() {
  const imageAssets: any = cacheStaticImg(Assets.images);
  await Promise.all([...imageAssets]).then(arg => {
  });
}

async function loadUserAssetAsync() {
  const loadInventory = new Promise((resolve, reject) => {
    inventory.fetch(resolve, reject).catch(err => console.log("Error fetching inventory:", err));
  });
  await Promise.all([loadInventory])
    .then(arg => console.log("SUCCESS USER LOAD", arg))
    .catch(err => console.log("[inventory] ", err))
}


// =======================================================================
// INVENTORY CACHING

const inventory = (() => {

  let cachedInventory: string = JSON.stringify([]);
  const cacheStorage = new CacheStorage();
  
  const fetchInventory = (() => {
  
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

    const getSpriteUrl = (itemName: string) => firebase
      .storage()
      .ref('item_sprites/' + itemName + '.png')
      .getDownloadURL();
  
    const cacheInventory = async (inventoryResolve: any, inventoryReject: any) => {
      const user = firebase.auth().currentUser;
  
      firebase
        .database()
        .ref('users/' + user?.uid + '/inventory')
        .once('value')
        .then(snapshot => {
          if (!snapshot) return ;

          let allItemUri: any[] = [];

          new Promise((allResolve, allReject) => {
            
            const inventory: string[] = snapshot.val();
            let promiseAllItems: Promise<unknown>[] = [];

            inventory?.forEach(async (item: string) => {
              const promise = new Promise((itemResolve, itemReject) => {
                Promise.all([getItemDescription(item), getItemUrl(item), getSpriteUrl(item)])
                  .then(async arg => {
                    itemResolve({ id: item, description: arg[0], url: arg[1], spriteUrl: arg[2] });
                    allItemUri.push({ uri: arg[1] });
                  })
                  .catch(err => itemReject(err));
              });
              promiseAllItems.push(promise);

            });
            Promise.all(promiseAllItems).then(allItems => allResolve(allItems)).catch(err => allReject(err))
  
          })
          .then(allItems => {

            allItemUri.length ? FastImage.preload(allItemUri) : null;
            const cacheItems = JSON.stringify(allItems);
            cacheStorage.setItem('inventory', cacheItems, 60 * 60 * 24)
              .then(() => {
                cacheStorage.getItem("inventory").then(arg => {
                  cachedInventory = arg!;
                  inventoryResolve("Success caching inventory")
                })
              })
              .catch(err => inventoryReject(err));
  
          })
          .catch(err => inventoryReject(err));
  
        });
    }
  
    return async (resolve: any, reject: any) => {
      cacheStorage.getItem("inventory")
        .then(arg => {
          console.log("CURRENT INVENTORY", arg)
          if (arg) {
            cachedInventory = arg;
            resolve("Success Cache Inventory")
          } else {
            cacheInventory(resolve, reject);
          }
        })
        .catch(err => reject(err));
    }
  })();
  
  return {
    fetch: fetchInventory,
    
    get cache() {
      return cachedInventory;
    },

    clear: () => cacheStorage.clear()
  }
})();

// INVENTORY CACHING
// =======================================================================

export { 
  loadAssetsAsync, 
  loadUserAssetAsync, 
  inventory 
}