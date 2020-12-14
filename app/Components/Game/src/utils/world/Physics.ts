import { getStatusBarHeight } from "react-native-status-bar-height";
import FlappyBallGame from "../..";
import { GameAlert } from "../helpers/alerts";
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

  // special relativity - everything related to wall observation
  const wallRelativity: Relativity = (() => { 
    let nextWall = 0, // we can't trust that all passing wall to player is index 0, so we increment this
        recentWallid: null | number | any = null;

    return (entities: Entities.All) => {
      (function moveWalls() { // @remind factor this into while
        let wallLen = entities.game.wallIds.length, wallIndex, wall;
        while (wallLen--) {
          wallIndex = entities.game.wallIds[wallLen];
          wall = entities[wallIndex];
          BODY.translate( wall.body, { x: -1.2, y: 0 } );
        }
      })();

      (function isWallPassedByPlayer() {
        const 
          currentWallid = entities.game.wallIds[nextWall],
          currentWall = entities[currentWallid],
          currentWallX = currentWall.body.position.x, // getting latest x of currently passing wall
          currentWallSize = (() => {
            if (Array.isArray(currentWall.size)) return currentWall.size[0];
            else throw "Physics.ts: error currentWall.size is not array";            
          })(),
          playerX = entities.player.body.position.x,
          playerSize = (() => {
            if (typeof entities.player.size === "number") return entities.player.size;
            else throw "Physics.ts: error ent.player.size is not number";
          })();
        if ((playerX - (playerSize/2)) > (currentWallX + (currentWallSize/2))) {
          nextWall++;
          console.log("recentWallid " + recentWallid + " && " + "currentWallid " + currentWallid);
          if (recentWallid === null || !entities[recentWallid]) {
            console.log("WALL IS NOT PAIR");
            recentWallid = currentWallid;
            entities.game.setState({ score: entities.game.state.score + 1 });
          }
          else console.log("WALL IS PAIR");
        }
      })();

      (function removeWall() {
        if ( 
          entities.game.wallIds.length > 0 
          && (function isWallOutOfVision() {
            const 
              wallIndex = entities.game.wallIds[0], 
              wall = entities[wallIndex]; // always the first wall
            if (!Array.isArray(wall.size)) throw "Physics.ts: error wall.size is not array";
            if ((wall.body.position.x + (wall.size[0] / 2)) < -getStatusBarHeight()) { // not < 0, because sometimes we indent based on getStatusBarHeight when oriented left
              COMPOSITE.remove(world, wall.body);
              delete entities[wallIndex]; 
              return true;
            }
            return false;
          })()
        ){ // then
          nextWall--;
          if (entities.game.wallIds[0] === recentWallid) recentWallid = null;
          entities.game.wallFreedIds.push(entities.game.wallIds[0]);
          entities.game.wallIds.splice(0, 1); // remove wall id in INDEX 0
        }
      })();

      (function showNextWall() {
        const wallLen = entities.game.wallIds.length;
        if (wallLen > 0) {
          const 
            lastPosId = entities.game.wallIds[wallLen-1], 
            lastPosX = entities[lastPosId].body.position.x,
            gameWidth = GameDimension.getWidth("now"),
            lastDistance = gameWidth - lastPosX,
            percentLastDist = lastDistance / gameWidth;
          if (percentLastDist >= WALL_DISTANCE) { // using recorded wall in last position
            console.log("CREATING WALL IN PHYSICS BASE ON DISTANCE: lastPos" + lastPosX + "gameWidth " + gameWidth);
            Entities.following.getWalls(entities);
            console.log(entities.game.wallIds);
          }
        }
      })();
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
