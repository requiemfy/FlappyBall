import { Dimensions } from "react-native";
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { GAME_LANDSCAPE_WIDTH, GAME_PORTRAIT_WIDTH, NAVBAR_HEIGHT } from "../world/constants";

//@todo create types everywhere
export namespace GameDimension {

  export function window() {
    const 
      { width, height } = Dimensions.get("window"),
      gameHeight = height - NAVBAR_HEIGHT,
      gameWidth = width - NAVBAR_HEIGHT;
  
    return {
      screenWidth: width,
      screenHeight: height,
      gameHeight: gameHeight,
    };
  }
  
  export function getOrientation(width: number, height: number): string {
    return width > height ? "landscape" : "portrait";
  }

  type When = { now: string, previous: string };
  type GameWidth = (when: keyof When) => number;
  export const getWidth: GameWidth = (() => {
    type DimParam = (dim1: number, dim2: number) => number;

    const getDim: DimParam = (dim1, dim2) => {
      const { screenWidth, screenHeight } = GameDimension.window(),
        orientation = GameDimension.getOrientation(screenWidth, screenHeight);
        if (orientation === "landscape") return dim1
        else return dim2;
    }

    return (when: keyof When) => {
      if (when === "now") return getDim(GAME_LANDSCAPE_WIDTH, GAME_PORTRAIT_WIDTH)
      else return getDim(GAME_PORTRAIT_WIDTH, GAME_LANDSCAPE_WIDTH);
    }
  })();
}
