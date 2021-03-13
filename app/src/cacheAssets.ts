import { Image } from 'react-native';
import { Asset } from 'expo-asset';
import { images } from './requireAssets';
import { firebase } from './firebase';
import CacheStorage from 'react-native-cache-storage';

let cachedInventory: string;
const cacheStorage = new CacheStorage();

function cacheImage(images: any[]) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

async function loadAssetsAsync() {
  // const imageAssets: any = cacheImage(images);
  // await Promise.all([...imageAssets]).then(arg => {
  // });
}

// function getCachedResources() {
//   const cachedImgs = images.map(image => {
//     return Asset.fromModule(image).name
//   })
// }

async function loadUserAssetAsync() {
  const inventory = new Promise((resolve, reject) => {
    setInventory(resolve, reject)
  });
  await Promise.all([inventory])
    .then(arg => console.log("SUCCESS USER LOAD", arg))
    .catch(err => console.log(err))
}


// =======================================================================
// INVENTORY CACHING

const setInventory = (() => {

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

  const cacheInventory = async (resolve: any, reject: any) => {
    const user = firebase.auth().currentUser;

    firebase
      .database()
      .ref('users/' + user?.uid + '/inventory')
      .once('value')
      .then(snapshot => {

        if (!snapshot) {
          console.log("SNAPSHOT", snapshot)
          cachedInventory = JSON.stringify([])
          return ;
        }

        new Promise((resolve, reject) => {
          
          const inventory: string[] = snapshot.val();
          let promises: Promise<unknown>[] = [];
          inventory?.forEach(async (item: string) => {
            const promise = new Promise((_resolve, _reject) => {
              Promise.all([getItemDescription(item), getItemUrl(item)])
                .then(async arg => _resolve({ id: item, description: arg[0], url: arg[1] }))
                .catch(err => _reject(err));
            })
            promises.push(promise);
          });
          Promise.all(promises).then(allItems => resolve(allItems)).catch(err => reject(err))

        })
        .then(allItems => {

          const cacheItems = JSON.stringify(allItems);
          cacheStorage.setItem('inventory', cacheItems, 60)
            .then(() => {
              cacheStorage.getItem("inventory").then(arg => {
                cachedInventory = arg!;
                resolve("Success Cache Inventory")
              })
            })
            .catch(err => reject(err));

        })
        .catch(err => reject(err));

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
    .catch(err => reject(err))
  }
})();

function getCachedInventory() {
  return cachedInventory;
}

// INVENTORY CACHING
// =======================================================================

export { 
  cacheImage, 
  loadAssetsAsync, 
  loadUserAssetAsync, 
  getCachedInventory 
}