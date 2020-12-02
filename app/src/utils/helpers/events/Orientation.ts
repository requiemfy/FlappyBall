
import { Dimensions } from "react-native";
import { GameEngine } from "react-native-game-engine";
import { getStatusBarHeight } from "react-native-status-bar-height";
import FlappyBallGame from "../../..";
import { BODY, GAME_LANDSCAPE_WIDTH, GAME_PORTRAIT_WIDTH, NAVBAR_HEIGHT, NOT_BODY, SCREEN_HEIGHT } from "../../world/constants";
import { Entities } from "../../world/Entities";

import { DeviceMotion } from 'expo-sensors';

import { GameDimension } from "../dimensions";

export namespace Orientation {
  type Event = (event: object) => void;
  type WallProps = { x: number, y: number, heightPercent: number };
  type Coordinates = { x: number, y: number };
  type OrientPlayer = (game: FlappyBallGame) => Coordinates;
  type OrientWall = (game: FlappyBallGame) => WallProps[];
  type OrientGame = (game: FlappyBallGame) => void;
  type OrientEntity = (x: number, y: number) => Coordinates;
  type PrevGameDimensions = (width: number, height: number) => { prevGameWidth: number, prevGameHeight: number };
  type EntityCoords = (entity: Entities.Physical) => { [key: string]: number };
  type UpdateAxis = (axis: number, previousDimension: number, currentDimension: number) => number;

  let callback: Event; // Event

  export const addChangeListener: OrientGame = (game) => {
    console.log("\torientation.tsx: addChangeListener!!!");

    callback = () => {
      ////////////////////////////////////////////////////////////
      console.log("\n\norientation.tsx:\n````````````````````````````````````````````````````````````");
      console.log("ORIENTATION CHANGED");
      console.log("game.paused: " + game.paused);
      ////////////////////////////////////////////////////////////
      !game.paused ? game.engine.stop() : null;
      changeOrientation(game);
    };
    Dimensions.addEventListener('change', callback); // luckily this will not invoke in eg. landscape left to landscape right

    // adding identation when Status bar is in the left side, because in actual devices some has something in the middle
    DeviceMotion.isAvailableAsync().then((supported) => {
      if (supported) {
        let prevOrient: number; // we are not sure what's first orientation
        DeviceMotion.addListener((current) => {
          if (prevOrient !== current.orientation) {
            console.log("orientation " + current.orientation);
            if (current.orientation == 90) game.setState({ left: getStatusBarHeight(), })
            else game.setState({ left: 0, });
            prevOrient = current.orientation;
          }
        });
      }
    });
  };

  export const removeChangeListener = () => {
    Dimensions.removeEventListener('change', callback);
    DeviceMotion.removeAllListeners();
  }

  // =============================== SPECIFIC ===============================
  const orientPlayerCoords: OrientPlayer = (game) => {
    const { lastEntX, lastEntY } = lastEntityCoords(game.entities.player);
    return orientEntityCoords(lastEntX, lastEntY); // updated coords
  }
  
  const orientWallCoords: OrientWall = (game) => {
    let wallProps: WallProps[] = [],
        wallIds = game.entities.wall,
        wallNum = wallIds.length;

    while(wallNum--) {
      const 
        wallKey = wallIds[wallNum],
        wall = game.entities[wallKey],
        heightPercent = { heightPercent: wall.heightPercent },
        { lastEntX, lastEntY } = lastEntityCoords(wall);

      console.log("ORIENTATION WALL " + wallKey);

      wallProps.push({ ...orientEntityCoords(lastEntX, lastEntY), ...heightPercent});
    }
    return wallProps; // [ {x: n, y: m, heightPercent: o}, ... ]
  }

  // ================================ CALCULATIONS ================================
  const changeOrientation: OrientGame = (game: FlappyBallGame) => {
    const coords = {
      player: orientPlayerCoords(game), 
      walls: orientWallCoords(game),
    };
    Entities.swap(game, coords);
  }

  const orientEntityCoords: OrientEntity = (lastEntX, lastEntY) => {
    const 
      { windowWidth, windowHeight, gameHeight } = GameDimension.window(), // current screen dimensions
      { prevGameHeight, prevGameWidth } = getPrevGameDim(windowWidth, windowHeight),
      gameWidth = GameDimension.getWidth("now"),
      updatedX = getUpdatedAxis(lastEntX, prevGameWidth, gameWidth),
      updatedY = getUpdatedAxis(lastEntY, prevGameHeight, gameHeight);
      ////////////////////////////////////////////////////////////
      console.log("\t----diemensions of x,y: " + windowWidth + ", " + windowHeight );
      console.log("\t----prev game dim: x,y" + prevGameWidth + ", " + prevGameHeight );
      console.log("\t----current game dim: x,y" + gameWidth + ", " + gameHeight );
      console.log("\t----Entity of x,y: " + lastEntX + ", " + lastEntY );
      console.log("\t----Update Entity of x,y: " + updatedX + ", " + updatedY );
      console.log("````````````````````````````````````````````````````````````");
      ////////////////////////////////////////////////////////////
    return { x: updatedX, y: updatedY };
  }

  const getPrevGameDim: PrevGameDimensions = (width, height) => {
    const
      prevHeight = width - NAVBAR_HEIGHT,
      prevWidth = GameDimension.getOrientation(width, height) === "landscape" ?
                  GAME_PORTRAIT_WIDTH : GAME_LANDSCAPE_WIDTH;
      // if landscape now, then prev is portrait
    return { prevGameWidth: prevWidth, prevGameHeight: prevHeight, }
  }

  
  const lastEntityCoords: EntityCoords = (entity) => {
    return {
      lastEntX: entity.body.position.x,
      lastEntY: entity.body.position.y,
    }
  } 
  
  const getUpdatedAxis: UpdateAxis = (lastAxis, prevDim, currentDim) => {
    const 
      percent = lastAxis / prevDim,
      updated = percent * currentDim;
    return updated;
  }
}

