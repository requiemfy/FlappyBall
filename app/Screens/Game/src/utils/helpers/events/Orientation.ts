import { Dimensions } from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";
import FlappyBallGame from "../../..";
import { GAME_LANDSCAPE_WIDTH, GAME_PORTRAIT_WIDTH, NAVBAR_HEIGHT } from "../../world/constants";
import { Entities } from "../../world/Entities";
import { DeviceMotion } from 'expo-sensors';
import { GameDimension } from "../dimensions";
import * as ScreenOrientation from 'expo-screen-orientation';

export namespace Orientation {
  type WallProps = { x: number, y: number, heightPercent: number };
  type Coordinates = { x: number, y: number };
  type OrientPlayer = (game: FlappyBallGame) => Coordinates;
  type OrientWall = (game: FlappyBallGame) => WallProps[];
  type OrientGame = (game: FlappyBallGame) => void;
  type OrientEntity = (x: number, y: number) => Coordinates;
  type PrevGameDimensions = (width: number, height: number) => { prevGameWidth: number, prevGameHeight: number };
  type EntityCoords = (entity: Entities.Physical<number | number[]>) => { [key: string]: number };
  type UpdateAxis = (axis: number, previousDimension: number, currentDimension: number) => number;

  let orientationCallback: ((event: object) => void) | null; // Event
  let dontRotate = false;
  let prevHeight = 0;
  let timeOutRotate: any;
  let deviceMotionSupp = false;

  export const disableRotate = (window: {width: number, height: number}) => {
    clearTimeout(timeOutRotate);
    dontRotate = true;
    window.width > window.height ? ScreenOrientation.lockAsync(5) : ScreenOrientation.lockAsync(2);
  }

  export const unlockRotate = () => {
    dontRotate = false;
    ScreenOrientation.lockAsync(0); // unlock
  }

  export const enableRotate = (game: FlappyBallGame) => {
    timeOutRotate = setTimeout(() => {
      if (!game.mounted) return;
      unlockRotate() 
      console.log("== orientation: enable rotate");
    }, 1000);
  }

  export const addChangeListener: OrientGame = (game) => {

    orientationCallback = (e: any) => {
      if (dontRotate || (prevHeight === e.window.height) || !game.mounted) return;
      !game.paused ? game.engine.stop() : null;
      changeOrientation(game);
      game.forceUpdate(); // this is for update of GameDimensions
      prevHeight = e.window.height
      disableRotate(e.window)
      enableRotate(game);
      console.log("== orientation: On orientation, height", e.window.height)
    };
    Dimensions.addEventListener('change', orientationCallback); // luckily this will not invoke in eg. landscape left to landscape right

    // adding identation when Status bar is in the left side, because in actual devices some has something in the middle
    DeviceMotion.isAvailableAsync().then((supported) => {
      if (supported) {
        deviceMotionSupp = true; 
        let prevOrient: number; // we are not sure what's first orientation
        DeviceMotion.addListener((current) => {
          if (dontRotate) return;
          if (prevOrient !== current.orientation) {
            if (current.orientation == 90) game.safeSetState({ left: getStatusBarHeight(), })
            else game.safeSetState({ left: 0, });
            prevOrient = current.orientation;
          }
        });
      }
    });
  };

  export const removeChangeListener = () => {
    Dimensions.removeEventListener('change', orientationCallback!);
    clearTimeout(timeOutRotate);
    if (deviceMotionSupp) DeviceMotion.removeAllListeners();
    orientationCallback = null;
    timeOutRotate = null;
    prevHeight = 0;
  }

  const changeOrientation: OrientGame = (game: FlappyBallGame) => {
    const coords = {
      player: orientPlayerCoords(game), 
      walls: orientWallCoords(game),
    };
    Entities.swap(game, coords);
  }

  // =============================== FOR SPECIFIC ENTITY ===============================
  const orientPlayerCoords: OrientPlayer = (game) => {
    const { lastEntX, lastEntY } = lastEntityCoords(game.entities.player);
    return orientEntityCoords(lastEntX, lastEntY); // updated coords
  }
  
  const orientWallCoords: OrientWall = (game) => { // @note INSPECTED: good
    let wallProps: WallProps[] = [],
        wallIds = game.wallIds,
        wallNum = wallIds.length,
        i = 0; // i did this (not wallNum--) to maintain index order of wall
    while(i < wallNum) {
      const 
        wallKey = wallIds[i],
        wall = game.entities[wallKey],
        maintainedProps = { heightPercent: wall.heightPercent, isStatic: wall.body.isStatic },
        { lastEntX, lastEntY } = lastEntityCoords(wall);
      wallProps.push({ ...orientEntityCoords(lastEntX, lastEntY), ...maintainedProps});
      i++;
    }
    return wallProps; // [ {x: n, y: m, heightPercent: o}, ... ]
  }

  // ================================ CALCULATIONS ================================
  const orientEntityCoords: OrientEntity = (lastEntX, lastEntY) => {
    const 
      { windowWidth, windowHeight, gameHeight } = GameDimension.window(), // current screen dimensions
      { prevGameHeight, prevGameWidth } = getPrevGameDim(windowWidth, windowHeight),
      gameWidth = GameDimension.getWidth("now"),
      updatedX = getUpdatedAxis(lastEntX, prevGameWidth, gameWidth),
      updatedY = getUpdatedAxis(lastEntY, prevGameHeight, gameHeight);
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

