import { Alert, Dimensions } from "react-native";

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

function safeSetState(obj: any) {
  return (update: any) => {
    if (obj.mounted) {
      console.log("== helpers: Component set STATE", obj.constructor.name);
      obj.setState(update);
    } else {
      console.log("== helpers: Component DONT set state",  obj.constructor.name);
    }
  }
}

function alert (one: string, two: string) {
  Alert.alert(one, two, [
    { 
      text: "OK", onPress: () => null
    }
  ]);
}

function alertQuit (cb: any, lastWords: string) {
  Alert.alert("Hold on!", lastWords, [
    {
      text: "Cancel",
      onPress: () => null,
      style: "cancel"
    },
    { text: "YES", onPress: () => {
      cb();
    }}
  ]);
}

export { backOnlyOnce, autoImageDim, safeSetState, alert, alertQuit }