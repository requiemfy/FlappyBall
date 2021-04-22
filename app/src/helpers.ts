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

export { backOnlyOnce, autoImageDim }