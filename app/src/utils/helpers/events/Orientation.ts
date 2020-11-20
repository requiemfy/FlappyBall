
import { Dimensions } from "react-native";
import FlappyBallGame from "../../..";
import { GAME_DIM_RATIO, GAME_LANDSCAPE_WIDTH, GAME_PORTRAIT_WIDTH, NAVBAR_HEIGHT, NOT_BODY } from "../../world/constants";
import { Entities } from "../../world/Entities";

// import window, { getOrientation } from "../dimensions";
import { GameDimension } from "../dimensions";

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

    // while(wallNum--) {
    for(let i = 0; i < wallNum; i++) {
      const 
        // wallKey = wallIds[wallNum],
        wallKey = wallIds[i],
        wall = game.entities[wallKey],
        { lastEntX, lastEntY } = lastEntityCoords(wall);
      console.log("ORIENTATION WALL " + wallKey);
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

  const orientEntityCoords: OrientEntity = (lastEntX, lastEntY) => {
    const 
      { screenWidth, screenHeight, gameHeight } = GameDimension.window(), // current screen dimensions
      { prevGameHeight, prevGameWidth } = getPrevGameDim(screenWidth, screenHeight),
      // gameWidth = GameDimension.getOrientation(screenWidth, screenHeight) === "landscape" ?
      //             GAME_LANDSCAPE_WIDTH : GAME_PORTRAIT_WIDTH,
      gameWidth = GameDimension.getWidth("now"),
      updatedX = getUpdatedAxis(lastEntX, prevGameWidth, gameWidth),
      updatedY = getUpdatedAxis(lastEntY, prevGameHeight, gameHeight);
      ////////////////////////////////////////////////////////////
      console.log("\t----diemensions of x,y: " + screenWidth + ", " + screenHeight );
      console.log("\t----prev game dim: x,y" + prevGameWidth + ", " + prevGameHeight );
      console.log("\t----current game dim: x,y" + gameWidth + ", " + gameHeight );
      console.log("\t----Entity of x,y: " + lastEntX + ", " + lastEntY );
      console.log("\t----Update Entity of x,y: " + updatedX + ", " + updatedY );
      console.log("````````````````````````````````````````````````````````````");
      ////////////////////////////////////////////////////////////

    return { x: updatedX, y: updatedY };
  }

  const getPrevGameDim = (width: number, height: number) => {
    const
      prevHeight = width - NAVBAR_HEIGHT,
      prevWidth = GameDimension.getOrientation(width, height) === "landscape" ?
                  GAME_PORTRAIT_WIDTH : GAME_LANDSCAPE_WIDTH;
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

