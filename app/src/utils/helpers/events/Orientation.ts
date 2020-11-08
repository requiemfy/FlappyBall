
import { Dimensions } from "react-native";
import FlappyBallGame from "../../..";
import { NAVBAR_HEIGHT } from "../../world/constants";
import { Entities } from "../../world/Entities";

import window from "../dimensions";

export namespace Orientation {
  type Event = (event: object) => void;
  type OrientGame = (game: FlappyBallGame) => void;
  type OrientPlayer = (game: FlappyBallGame) => number[];
  type OrientEntity = (x: number, y: number) => number[];
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
    Entities.swap(game, [orientPlayerCoords(game)]);
  }
  
  const orientPlayerCoords: OrientPlayer = (game) => {
    const { lastEntX, lastEntY } = lastEntityCoords(game.entities.player);
    return orientEntityCoords(lastEntX, lastEntY);
  }
  
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
    return [ updatedX, updatedY ];
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

