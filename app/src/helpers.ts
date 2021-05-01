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
    if (obj.mounted) obj.setState(update);
  }
}

function alert (one: string, two: string) {
  Alert.alert(one, two, [
    { 
      text: "OK", onPress: () => null
    }
  ]);
}

export { backOnlyOnce, autoImageDim, safeSetState, alert }