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
      console.log("== helpers: Component set STATE", obj.constructor.name, update);
      obj.setState(update);
    } else {
      console.log("== helpers: Component DONT set state",  obj.constructor.name);
    }
  }
}

function alert (one: string, two: string, ok: any = () => null) {
  Alert.alert(one, two, [
    { 
      text: "OK", onPress: ok
    }
  ]);
}

function alertQuit (yes: any = () => null, lastWords: string, cancel: any = () => null) {
  Alert.alert("Hold on!", lastWords, [
    {
      text: "Cancel",
      onPress: cancel,
      style: "cancel"
    },
    { text: "YES", onPress: yes
    }
  ]);
}

function getOrientation (window: any) {
  if (window.height > window.width) {
    console.log("TEST orient portrait");
    return "portrait";
  } else {
    console.log("TEST orient landscape");
    return "landscape";
  }
}

let inventoryObj: any, shopObj: any, homeObj: any;

function inventoryRef(obj?: any) {
  if (obj || (obj === null)) inventoryObj = obj;
  console.log("== helpers: inventoryRef value", shopObj ? shopObj.constructor.name : shopObj)
  return inventoryObj;
}

function shopRef(obj?: any) {
  if (obj || (obj === null)) shopObj = obj;
  console.log("== helpers: shopRef value", shopObj ? shopObj.constructor.name : shopObj)
  return shopObj;
}

function homeRef(obj?: any) {
  if (obj || (obj === null)) homeObj = obj;
  console.log("== helpers: homeRef value", homeObj ? homeObj.constructor.name : homeObj)
  return homeObj;
}

export { 
  backOnlyOnce, 
  autoImageDim, 
  safeSetState, 
  alert, 
  alertQuit,
  homeRef,
  inventoryRef,
  shopRef,
  getOrientation
}