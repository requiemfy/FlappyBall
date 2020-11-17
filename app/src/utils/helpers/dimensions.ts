import { Dimensions } from "react-native"
import { NAVBAR_HEIGHT } from "../world/constants";

export default function window() {
  const 
    { width, height } = Dimensions.get("window"),
    gameHeight = height - NAVBAR_HEIGHT,
    gameWidth = width - NAVBAR_HEIGHT;

  return {
    width: width,
    height: height,
    gameHeight: gameHeight,
    gameWidth: gameWidth
  };
}