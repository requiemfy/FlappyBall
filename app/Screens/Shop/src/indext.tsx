

  // SHOP

  // in constructor:::
  // const reference = firebase.storage().ref('item_images');
  // this.listInventory(reference).then(() => {
  //   console.log('Finished listing');
  // });


  // listInventory = (
  //   reference: firebase.storage.Reference
  // ): Promise<any> => {
  //   return reference.list().then( async (result) => {
  //     let items: Item[] = [];

      // await new Promise((resolve) => {
      //   result.items.forEach(async (ref) => {
      //     let url, itemName, description!: string;
      //     // set itemName
      //     itemName = ref.name.replace('.png', '');
      //     // set url
      //     url = await firebase.storage()
      //       .ref(ref.fullPath)
      //       .getDownloadURL();
      //     // set description
      //     await firebase
      //       .database()
      //       .ref('items/' + itemName + '/description')
      //       .once("value")
      //       .then(snapshot => {
      //         description = snapshot.val();
      //       });
      //     items = [
      //       ...items,
      //       {
      //         id: itemName,
      //         description: description,
      //         url: url,
      //       }
      //     ];
  
      //     if (result.items.indexOf(ref) === (result.items.length-1)) {
      //       resolve(null) 
      //     }
      //   })
      // });

  //     console.log("items", items)
  //     this.setState({ items: items })
  //     return Promise.resolve();
  //   });
  // }
