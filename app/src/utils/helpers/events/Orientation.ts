
import { Dimensions } from "react-native";
import FlappyBallGame from "../../..";
import { GAME_DIM_RATIO, MAX_BASE_WIDTH, NAVBAR_HEIGHT, NOT_BODY } from "../../world/constants";
import { Entities } from "../../world/Entities";

import window, { getOrientation } from "../dimensions";

export namespace Orientation {
  type Event = (event: object) => void;
  type OrientGame = (game: FlappyBallGame) => void;
  type Coordinates = { x: number, y: number };
  type OrientPlayer = (game: FlappyBallGame) => Coordinates;
  type OrientEntity = (x: number, y: number) => Coordinates;
  type EntityCoords = (entity: Entities.Physical) => { [key: string]: number };
  type UpdateAxis = (axis: number, previousDimension: number, currentDimension: number) => number;

  let callback: Event;

  export const addChangeListener: OrientGame = (game) => {
    console.log("\torientation.tsx: addChangeListener!!!");
    callback = (event: object) => {
      ////////////////////////////////////////////////////////////
      console.log("\n\norientation.tsx:\n````````````````````````````````````````````````````````````");
      console.log("ORIENTATION CHANGED");
      console.log("game.paused: " + game.paused);
      ////////////////////////////////////////////////////////////
      !game.paused ? game.engine.stop() : null;
      changeOrientation(game);
    };
    Dimensions.addEventListener('change', callback);
  };

  export const removeChangeListener = () => Dimensions.removeEventListener('change', callback);

  // =============================== SPECIFIC ===============================
  const orientPlayerCoords: OrientPlayer = (game) => {
    const { lastEntX, lastEntY } = lastEntityCoords(game.entities.player);
    return orientEntityCoords(lastEntX, lastEntY); // updated coords
  }
  
  const orientWallCoords = (game: any) => {
    let wallsCoords = [],
        wallIds = game.entities.wall,
        wallNum = wallIds.length;

    while(wallNum--) {
        const 
          wallKey = wallIds[wallNum],
          wall = game.entities[wallKey],
          { lastEntX, lastEntY } = lastEntityCoords(wall);
        wallsCoords.push(orientEntityCoords(lastEntX, lastEntY));
    }

    return wallsCoords;
  }

  // ================================ GENERAL ================================
  const changeOrientation: OrientGame = (game: FlappyBallGame) => {
    const coords = {
      player: orientPlayerCoords(game), 
      walls: orientWallCoords(game),
    };
    Entities.swap(game, coords);
  }

  //@todo fix orientation percentage
  // issues: wall distance is affected by orientation wtf
  const orientEntityCoords: OrientEntity = (lastEntX, lastEntY) => {
    // const 
    //   { width, height, gameHeight } = window(),
    //   [ prevWidth, prevGameHeight ] = [ height, width - NAVBAR_HEIGHT ], // this is tricky
    //   updatedX = getUpdatedAxis(lastEntX, prevWidth, width),
    //   updatedY = getUpdatedAxis(lastEntY, prevGameHeight, gameHeight);
    //   ////////////////////////////////////////////////////////////
    //   console.log("\t----diemensions of x,y: " + width + ", " + height );
    //   console.log("\t----lastPlayer of x,y: " + lastEntX + ", " + lastEntY );
    //   console.log("\t----updatedPlayerCoords of x,y: " + updatedX + ", " + updatedY );
    //   console.log("````````````````````````````````````````````````````````````");
    //   ////////////////////////////////////////////////////////////

    const 
      { width, height, gameHeight } = window(), // current screen dimensions
      { prevGameHeight, prevGameWidth } = getPrevGameDim(width, height),
      // gameWidth = GAME_DIM_RATIO * gameHeight, // current game width //@remind clear here
      gameWidth = getOrientation(width, height) === "landscape" ?
                  width : MAX_BASE_WIDTH,
      updatedX = getUpdatedAxis(lastEntX, prevGameWidth, gameWidth),
      updatedY = getUpdatedAxis(lastEntY, prevGameHeight, gameHeight);
      ////////////////////////////////////////////////////////////
      console.log("\t----diemensions of x,y: " + width + ", " + height );
      console.log("\t----lastPlayer of x,y: " + lastEntX + ", " + lastEntY );
      console.log("\t----updatedPlayerCoords of x,y: " + updatedX + ", " + updatedY );
      console.log("````````````````````````````````````````````````````````````");
      ////////////////////////////////////////////////////////////

    return { x: updatedX, y: updatedY };
  }

  const getPrevGameDim = (width: number, height: number) => {
    const
      prevHeight = width - NAVBAR_HEIGHT,

      //@remind clear HERE
      // prevWidth = GAME_DIM_RATIO * prevHeight;
      prevWidth = getOrientation(width, height) === "landscape" ?
                  MAX_BASE_WIDTH : width;
      //if landscape now, then prev is portrait


    return { prevGameHeight: prevHeight, prevGameWidth: prevWidth }
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

