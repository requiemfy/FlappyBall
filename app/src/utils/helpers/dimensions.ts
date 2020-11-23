import { Dimensions } from "react-native";
import { GAME_LANDSCAPE_WIDTH, GAME_PORTRAIT_WIDTH, NAVBAR_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH } from "../world/constants";

export namespace GameDimension {
  type When = { now: string, previous: string };
  type GameWidth = (when: keyof When) => number;
  type GameWindow = () => { windowWidth: number, windowHeight: number, gameHeight: number }
  type Orientation = (width: number, height: number) => string; 

  export const window: GameWindow = () => { // @note this is game window, not device
    const 
      { width, height } = Dimensions.get("window"),
      orientation = getOrientation(width, height);
    let screenW, screenH, gameHeight;
    if (orientation === "landscape") {
      screenW = SCREEN_HEIGHT;
      screenH = SCREEN_WIDTH
    } else {
      screenW = SCREEN_WIDTH;
      screenH = SCREEN_HEIGHT;
    }
    gameHeight = screenH - NAVBAR_HEIGHT;  
    return {
      windowWidth: screenW,
      windowHeight: screenH,
      gameHeight: gameHeight, // @note from roof to floor
    };
  }
  
  // @note i created this independet function for getting orientation
  // instead of always use class object and rely on class orientation property everytime i needed
  export const getOrientation: Orientation = (width, height) => {
    return width > height ? "landscape" : "portrait";
  }
  
  export const getWidth: GameWidth = (() => {
    type DimParam = (dim1: number, dim2: number) => number;
    const getDim: DimParam = (dim1, dim2) => {
      const { windowWidth, windowHeight } = GameDimension.window(),
        orientation = GameDimension.getOrientation(windowWidth, windowHeight);
        if (orientation === "landscape") return dim1
        else return dim2;
    }
    return (when: keyof When) => {
      if (when === "now") return getDim(GAME_LANDSCAPE_WIDTH, GAME_PORTRAIT_WIDTH)
      else return getDim(GAME_PORTRAIT_WIDTH, GAME_LANDSCAPE_WIDTH);
    }
  })();
}
