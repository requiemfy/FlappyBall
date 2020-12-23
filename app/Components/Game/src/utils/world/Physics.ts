import { Dimensions } from "react-native";
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
  type Player = { velocity: Relativity, gravity: (scale: number) => void }
  
  // this GameEngine system is called every ticks
  // that's why i didn't put collision event listener here
  // yes 2nd param should be like that
  export const system: Physics = (entities, { time }) => { // @note INSPECTED: good
    world.gravity.y = Math.abs(entities.game.gravity);
    wallRelativity(entities);
    playerRelativity.velocity(entities);
    // //////////////////////////////////////////////////////////
    // entities.distance+=1; // this is on the entities script
    // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    // console.log("physics.tsx: distance " + entities.distance);
    // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    // //////////////////////////////////////////////////////////
    ENGINE.update(engine, time.delta);
    return entities;
  };


  export const playerRelativity = (() => { // @note INSPECTED: good
    let playerGravity: number;
    (function initGravity() {
      let { width, height } = Dimensions.get("window"),
        orient = GameDimension.getOrientation(width, height);
      if (orient === "landscape") playerGravity = 0.001;
      else playerGravity = 0.0025;
    })();
    return <Player>{
      velocity: <Relativity>function (entities) {
        const player = entities.player;
        BODY.applyForce(player.body, player.body.velocity, {
          x: 0,
          y: world.gravity.y * player.body.mass * playerGravity
        });
      },
      gravity: (scale) => playerGravity = scale,
    }
  })();

  // special relativity - everything related to wall observation
  const wallRelativity = (() => { // @note INSPECTED: good
    let nextWall = 0; // we can't trust that all passing wall to player is index 0, so we increment this
    let possiblyFallingWall = false;

    return <Relativity>function (entities) {
      (function moveWalls() { // @note INSPECTED: good
        let wallLen = entities.game.wallIds.length, wallIndex, wall;
        while (wallLen--) { // order doesn't matter, just move all the wall
          wallIndex = entities.game.wallIds[wallLen];
          wall = entities[wallIndex];
          BODY.translate( wall.body, { x: -1.2, y: 0 } );
        }
      })();

      (function isWallPassedByPlayer() { // @note INSPECTED: good
        const 
          currentWallid = entities.game.wallIds[nextWall],
          currentWall = entities[currentWallid],
          currentWallX = currentWall.body.position.x, // getting latest x of currently passing wall
          currentWallSize = currentWall.size[0],
          playerX = entities.player.body.position.x,
          playerSize = entities.player.size;
        
        if ((playerX - (playerSize/2)) > (currentWallX + (currentWallSize/2))) {
          let recentWallid = nextWall > 0 ? entities.game.wallIds[nextWall-1] : null;
          console.log("recentWallid " + recentWallid + " && " + "currentWallid " + currentWallid);
          if (recentWallid === null || !entities[recentWallid]) {
            console.log("WALL IS NOT PAIR");
            entities.game.setState({ score: entities.game.state.score + 1 });
            possiblyFallingWall = true;
          }
          else console.log("WALL IS PAIR"); // recent wall is not unmounted, meaning very close to the current wall
          nextWall++;
        }
      })();

      (function removeWall() { // @note INSPECTED: good
        if ( 
          entities.game.wallIds.length > 0 
          && (function isWallOutOfVision() { // removes the OBJECT and BODY
            const wallIndex = entities.game.wallIds[0], wall = entities[wallIndex]; // always the first wall
            if ((wall.body.position.x + (wall.size[0] / 2)) < -getStatusBarHeight()) { // not < 0, because sometimes we indent based on getStatusBarHeight when oriented left
              COMPOSITE.remove(world, wall.body);
              delete entities[wallIndex]; 
              return true;
            }
            return false;
          })()
        ){ // then adjust the wall IDs
          nextWall--;
          entities.game.wallFreedIds.push(entities.game.wallIds.splice(0, 1)[0]); // add to available id
        }
      })();

      (function showNextWall() { // @note INSPECTED: good
        const wallLen = entities.game.wallIds.length;
        if (wallLen > 0) {
          const 
            lastPosId = entities.game.wallIds[wallLen-1], 
            lastPosX = entities[lastPosId].body.position.x,
            gameWidth = GameDimension.getWidth("now"),
            lastDistance = gameWidth - lastPosX,
            percentLastDist = lastDistance / gameWidth;
          if (percentLastDist >= WALL_DISTANCE) { // using wall in last position
            console.log("CREATING WALL IN PHYSICS BASE ON DISTANCE: lastPos" + lastPosX + "gameWidth " + gameWidth);
            Entities.following.getWalls(entities);
            console.log(entities.game.wallIds);
          }
        }
      })();

      (function isWallFalling() { // @note INSPECTED: good
        if ((entities.game.state.score > 0) && possiblyFallingWall && Math.random() > 0.3) {
          const roofY = entities.roof.body.position.y;
          const floorY = entities.floor.body.position.y;
          const wall = entities[entities.game.wallIds[1]];
          const wallY = wall.body.position.y;
          const roof_and_Wall = wallY - roofY;
          const floor_and_Wall = floorY - wallY;
          // check if wall is hanging, then fall
          if (roof_and_Wall < floor_and_Wall) BODY.setStatic(wall.body, false);
          possiblyFallingWall = false;
          console.log("////////////////////////////////////////////////////////////")
          console.log("Physics.ts")
          console.log("roof_and_Wall " + roof_and_Wall);
          console.log("floor_and_Wall " + floor_and_Wall);
          console.log("////////////////////////////////////////////////////////////")
        }
      })();
    }
  })();

  // this is called in componentDidMount() 
  export const collision: Event = (game) => { // @note INSPECTED: good
    EVENTS.on(engine, 'collisionStart', (event) => {
      ////////////////////////////////////////////////////////////
      console.log("\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      console.log("physics.tsx: COLLIDED... GAME OVER");
      let pairs = event.pairs;
      console.log("colision between " + pairs[0].bodyA.label + " - " + pairs[0].bodyB.label);
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      ////////////////////////////////////////////////////////////
      if (pairs[0].bodyA.label === "Player-Circle") {
        const
          player = pairs[0].bodyA.label === "Player-Circle",
          playerFloorCollision = player && pairs[0].bodyB.label === "Floor-Rectangle",
          playerRoofCollision = player && pairs[0].bodyB.label === "Roof-Rectangle",
          playerWallCollision = player && pairs[0].bodyB.label === "Wall-Rectangle";
        if (playerFloorCollision || playerRoofCollision || playerWallCollision) {
          // alternative for this is use dispatch method of GameEngine
          game.over = true;
          game.paused = true; // for orientation change while game over
          // -----------------------------------------------------------
          // engine.stop() doesn't work here in matter EVENTS,
          // but works with setTimeout() as callback, i donno why
          setTimeout(() => game.engine.stop(), 0);
          // -----------------------------------------------------------
          GameAlert.gameOver();
        }
      }
    });
  }
  
}
