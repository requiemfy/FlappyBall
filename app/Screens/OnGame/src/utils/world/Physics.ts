import { Bodies } from "matter-js";
import { getStatusBarHeight } from "react-native-status-bar-height";
import FlappyBallGame from "../..";
import { GameAlert } from "../helpers/alerts";
import { Coordinates } from "../helpers/coordinates";
import { GameDimension } from "../helpers/dimensions";
import { 
  BODY, 
  engine, 
  world, 
  ENGINE, 
  EVENTS, 
  COMPOSITE, 
  WALL_DISTANCE, 
} from "./constants";
import { Entities } from './Entities';

export namespace Physics {
  type Physics = (entities: Entities.All, { time }: any) => Entities.All;
  type Event = (game: FlappyBallGame) => void;
  type Relativity = (entiies: Entities.All) => void;
  
  // this GameEngine system is called every ticks
  // that's why i didn't put collision event listener here
  // yes 2nd param should be object
  export const system: Physics = (entities, { time }) => {
    const { engine } = entities.physics;
    engine.world.gravity.y = entities.gravity;

    wallRelativity(entities);

    // //////////////////////////////////////////////////////////
    // entities.distance+=1; // this is on the entities script
    // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    // console.log("physics.tsx: distance " + entities.distance);
    // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    // //////////////////////////////////////////////////////////
    ENGINE.update(engine, time.delta);
    return entities;
  };

  // special relativity
  const wallRelativity: Relativity = (() => { 
    const entities: { get?: any } = {};
    const moveWalls = () => {
      let wallLen = entities.get.wall.length, wallIndex, wall;
      (function move(){
        if (wallLen > 0) {
          wallIndex = entities.get.wall[wallLen-1];
          wall = entities.get[wallIndex];
          wallLen--;
          BODY.translate( wall.body, { x: -1.2, y: 0 } );
          move();
        }
      })();
    }
    const isWallOutOfVision = () => {
      const wallIndex = entities.get.wall[0], wall = entities.get[wallIndex]; // always the first wall
      // if ((wall.body.position.x + (wall.size[0] / 2)) < 0) {
      if ((wall.body.position.x + (wall.size[0] / 2)) < -getStatusBarHeight()) { // not < 0, because sometimes we indent based on getStatusBarHeight when oriented left
        COMPOSITE.remove(world, wall.body);
        delete entities.get[wallIndex]; // this is necessary
        return true;
      }
      return false;
    }
    const removeWall = () => {
      if ( entities.get.wall.length > 0 && isWallOutOfVision()) entities.get.wall.splice(0, 1); // remove wall id
    }
    const showNextWall = () => {
      if (entities.get.wall.length > 0) {
        const 
          lastPosId = entities.get.wallInLastPos, // wallInLastPos is initialize in following.getWalls
          lastPosX = entities.get[lastPosId].body.position.x,
          gameWidth = GameDimension.getWidth("now"),
          lastDistance = gameWidth - lastPosX,
          percentLastDist = lastDistance / gameWidth;
        // i have to check first wall and last wall because i don't really care much about wall ids
        // so i can't certainly say which wall id is the very last, but i'm certain they are in order
        // there are chances that wall id is in descending order, else ascending
        if (percentLastDist >= WALL_DISTANCE) {
          console.log("CREATING WALL IN PHYSICS BASE ON DISTANCE: lastPos" + lastPosX + "gameWidth " + gameWidth);
          Entities.following.getWalls(entities.get);
        }
      }
    }
    return (ent: Entities.All) => {
      Object.defineProperty(entities, "get", { get() { return ent }, configurable: true });
      moveWalls();
      removeWall();
      showNextWall();
    }
  })();

  // this is called in componentDidMount() 
  export const collision: Event = (game) => {
    EVENTS.on(engine, 'collisionStart', (event) => {
      ////////////////////////////////////////////////////////////
      console.log("\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      console.log("physics.tsx: COLLIDED... GAME OVER");
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      ////////////////////////////////////////////////////////////
      // alternative for this is use dispatch method of GameEngine
      game.over = true;
      game.paused = true; // for orientation change while game over
      // -----------------------------------------------------------
      // engine.stop() doesn't work here in matter EVENTS,
      // but works with setTimeout() as callback, i donno why
      setTimeout(() => game.engine.stop(), 0);
      // -----------------------------------------------------------
      GameAlert.gameOver();
    });
  }
  
}