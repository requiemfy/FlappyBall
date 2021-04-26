import firebase from "firebase";
import { Dimensions } from "react-native";

function backOnlyOnce(obj: any) {
  obj.props.navigation?.goBack();
  obj.backHandler.remove();
}

function autoImageDim(actualW: number, actualH: number) {
  const win = Dimensions.get('window'),
    ratio = win.width/actualW,
    width = win.width,
    height = actualH * ratio;
  return { width, height }
}


// function updateGold(userID: string | undefined, updated: number, resolve: any, reject: any) {
//   firebase
//     .database()
//     .ref('users/' + userID)
//     .update({ gold: updated })
//     .then(_ => resolve(_))
//     .catch(_ => reject(_));
// }

export { backOnlyOnce, autoImageDim }