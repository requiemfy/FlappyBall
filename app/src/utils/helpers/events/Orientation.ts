
import { Dimensions } from "react-native";
import FlappyBallGame from "../../..";
import { NAVBAR_HEIGHT } from "../../world/constants";
import { Entities } from "../../world/Entities";

import window from "../dimensions";

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
      const userPaused = game.paused;
      !userPaused ? game.engine.stop() : null;
      changeOrientation(game);
      !userPaused ? game.engine.start() : null;
    };
    Dimensions.addEventListener('change', callback);
  };

  export const removeChangeListener = () => Dimensions.removeEventListener('change', callback);

  // helper functions
  const changeOrientation: OrientGame = (game: FlappyBallGame) => {
    const bodies = {
      player: orientPlayerCoords(game), 
      // walls: orientWallCoords(game),
      // walls: [null]
    };
    Entities.swap(game, bodies);
  }

  const orientPlayerCoords: OrientPlayer = (game) => {
    const { lastEntX, lastEntY } = lastEntityCoords(game.entities.player);
    return orientEntityCoords(lastEntX, lastEntY);
  }
  
  const orientWallCoords = (game: any) => {
    let walls = [];
    for (let i = 0; i < game.entities.wall.length; i++) {
      const { lastEntX, lastEntY } = lastEntityCoords(game.entities[i]);
      walls.push([orientEntityCoords(lastEntX, lastEntY)]);
    }
    return walls;
  }

  // ------------------------- GENERAL -------------------------
  const orientEntityCoords: OrientEntity = (lastEntX, lastEntY) => {
    const 
      { width, height, gameHeight } = window(),
      [ prevWidth, prevHeight ] = [ height, width - NAVBAR_HEIGHT ], // this is tricky
      updatedX = getUpdatedAxis(lastEntX, prevWidth, width),
      updatedY = getUpdatedAxis(lastEntY, prevHeight, gameHeight);
      ////////////////////////////////////////////////////////////
      console.log("\t----diemensions of x,y: " + width + ", " + height );
      console.log("\t----lastPlayer of x,y: " + lastEntX + ", " + lastEntY );
      console.log("\t----updatedPlayerCoords of x,y: " + updatedX + ", " + updatedY );
      console.log("````````````````````````````````````````````````````````````");
      ////////////////////////////////////////////////////////////
    // return [ updatedX, updatedY ];
    // return { center: { x: updatedX, y: updatedY } };
    return { x: updatedX, y: updatedY };
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

