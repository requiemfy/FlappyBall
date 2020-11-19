import { Dimensions } from "react-native"
import { GAME_LANDSCAPE_WIDTH, GAME_PORTRAIT_WIDTH, NAVBAR_HEIGHT } from "../world/constants";

//@remind make namespace
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
      gameWidth: gameWidth //@remind clear this if possible
    };
  }
  
  export function getOrientation(width: number, height: number): string {
    return width > height ? "landscape" : "portrait";
  }

  //@todo now use this to other
  export const getWidth = (() => {
    type DimParam = (dim1: number, dim2: number) => number;
    type WhenParam = { now: string, previous: string };

    const getDim: DimParam = (dim1, dim2) => {
      const { screenWidth, screenHeight } = GameDimension.window(),
        orientation = GameDimension.getOrientation(screenWidth, screenHeight);
        if (orientation === "landscape") return dim1
        else return dim2;
    }

    return (when: keyof WhenParam) => {
      if (when === "now") return getDim(GAME_LANDSCAPE_WIDTH, GAME_PORTRAIT_WIDTH)
      else return getDim(GAME_PORTRAIT_WIDTH, GAME_LANDSCAPE_WIDTH);
    }
  })();
}
