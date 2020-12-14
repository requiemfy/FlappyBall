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
    // const entities: { get?: Entities.All } = {};
    let nextWall = 0, // we can't trust that all passing wall to player is index 0, so we increment this
        recentWallid: null | number | any = null;

    // const moveWalls = () => { // @remind factor this into while
    //   // if (!entities.get) throw "Physics.ts: entities.get is undefined";
    //   let wallLen = entities.get.game.wall.length, wallIndex, wall;
    //   (function move(){
    //     if (wallLen > 0) {
    //       wallIndex = entities.get.game.wall[wallLen-1];
    //       wall = entities.get[wallIndex];
    //       wallLen--;
    //       BODY.translate( wall.body, { x: -1.2, y: 0 } );
    //       move();
    //     }
    //   })();
    // }

    // const isWallPassedByPlayer = () => {
    //   // if (!entities.get) throw "Physics.ts: entities.get is undefined";
    //   const 
    //     ent: Entities.All = entities.get, 
    //     currentWallid = ent.game.wall[nextWall],
    //     currentWall = ent[currentWallid],
    //     currentWallX = currentWall.body.position.x, // getting latest x of currently passing wall
    //     currentWallSize = (() => {
    //         if (Array.isArray(currentWall.size)) return currentWall.size[0];
    //         else throw "Physics.ts: error currentWall.size is not array";            
    //     })(),
    //     playerX = ent.player.body.position.x,
    //     playerSize = (() => {
    //         if (typeof ent.player.size === "number") return ent.player.size;
    //         else throw "Physics.ts: error ent.player.size is not number";
    //     })();
    //   if ((playerX - (playerSize/2)) > (currentWallX + (currentWallSize/2))) {
    //     nextWall++;
    //     console.log("recentWallid " + recentWallid + " && " + "currentWallid " + currentWallid);
    //     if (recentWallid === null || !ent[recentWallid]) {
    //       console.log("WALL IS NOT PAIR");
    //       recentWallid = currentWallid;
    //       ent.game.setState({ score: ent.game.state.score + 1 });
    //     }
    //     else console.log("WALL IS PAIR");
    //   }
    // }

    // const isWallOutOfVision = () => {
    //   // if (!entities.get) throw "Physics.ts: entities.get is undefined";
    //   const 
    //     wallIndex = entities.get.game.wall[0], 
    //     wall = entities.get[wallIndex]; // always the first wall
    //   if (!Array.isArray(wall.size)) throw "Physics.ts: error wall.size is not array";
    //   if ((wall.body.position.x + (wall.size[0] / 2)) < -getStatusBarHeight()) { // not < 0, because sometimes we indent based on getStatusBarHeight when oriented left
    //     COMPOSITE.remove(world, wall.body);
    //     delete entities.get[wallIndex]; 
    //     return true;
    //   }
    //   return false;
    // }

    // const removeWall = () => {
    //   // if (!entities.get) throw "Physics.ts: entities.get is undefined";
    //   if ( entities.get.game.wall.length > 0 && isWallOutOfVision()) {
    //     nextWall--;
    //     if (entities.get.game.wall[0] === recentWallid) recentWallid = null;
    //     entities.get.game.wall.splice(0, 1); // remove wall id in INDEX 0
    //   }
    // }

    // const showNextWall = () => {
    //   // if (!entities.get) throw "Physics.ts: entities.get is undefined";
    //   const wallLen = entities.get.game.wall.length;
    //   if (wallLen > 0) {
    //     const 
    //       lastPosId = entities.get.game.wall[wallLen-1], 
    //       lastPosX = entities.get[lastPosId].body.position.x,
    //       gameWidth = GameDimension.getWidth("now"),
    //       lastDistance = gameWidth - lastPosX,
    //       percentLastDist = lastDistance / gameWidth;
    //     if (percentLastDist >= WALL_DISTANCE) { // using recorded wall in last position
    //       console.log("CREATING WALL IN PHYSICS BASE ON DISTANCE: lastPos" + lastPosX + "gameWidth " + gameWidth);
    //       console.log(entities.get.game.wall);
    //       Entities.following.getWalls(entities.get);
    //     }
    //   }
    // }
    
    return (entities: Entities.All) => {
      // Object.defineProperty(entities, "get", { get() { return ent }, configurable: true });
      // moveWalls();
      // isWallPassedByPlayer(); // then add score
      // removeWall(); // wall index 0
      // showNextWall(); // push wall

      (function moveWalls() { // @remind factor this into while
        let wallLen = entities.game.wall.length, wallIndex, wall;
        while (wallLen--) {
          wallIndex = entities.game.wall[wallLen];
          wall = entities[wallIndex];
          BODY.translate( wall.body, { x: -1.2, y: 0 } );
        }
      })();

      (function isWallPassedByPlayer() {
        const 
          currentWallid = entities.game.wall[nextWall],
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
          entities.game.wall.length > 0 
          && (function isWallOutOfVision() {
            const 
              wallIndex = entities.game.wall[0], 
              wall = entities[wallIndex]; // always the first wall
            if (!Array.isArray(wall.size)) throw "Physics.ts: error wall.size is not array";
            if ((wall.body.position.x + (wall.size[0] / 2)) < -getStatusBarHeight()) { // not < 0, because sometimes we indent based on getStatusBarHeight when oriented left
              COMPOSITE.remove(world, wall.body);
              delete entities[wallIndex]; 
              return true;
            }
            return false;
          })()
        ){
          nextWall--;
          if (entities.game.wall[0] === recentWallid) recentWallid = null;
          entities.game.wall.splice(0, 1); // remove wall id in INDEX 0
        }
      })();

      (function showNextWall() {
        const wallLen = entities.game.wall.length;
        if (wallLen > 0) {
          const 
            lastPosId = entities.game.wall[wallLen-1], 
            lastPosX = entities[lastPosId].body.position.x,
            gameWidth = GameDimension.getWidth("now"),
            lastDistance = gameWidth - lastPosX,
            percentLastDist = lastDistance / gameWidth;
          if (percentLastDist >= WALL_DISTANCE) { // using recorded wall in last position
            console.log("CREATING WALL IN PHYSICS BASE ON DISTANCE: lastPos" + lastPosX + "gameWidth " + gameWidth);
            Entities.following.getWalls(entities);
            console.log(entities.game.wall);
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
