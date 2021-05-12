import { Dimensions } from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";
import FlappyBallGame from "../..";
import { GameDimension } from "../helpers/dimensions";
import { 
  BODY, 
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
  
  export const system: Physics = (entities, { time }) => { 
    entities.game.matterWorld.gravity.y = Math.abs(entities.game.gravity);
    wallRelativity(entities);
    playerRelativity.velocity(entities);
    ENGINE.update(entities.game.matterEngine, time.delta);
    return entities;
  };

  export const playerRelativity = (() => { 
    let playerGravity: number;
    (function initGravity() {
      let { width, height } = Dimensions.get("window"),
        orient = GameDimension.getOrientation(width, height);
      if (orient === "landscape") playerGravity = 0.001;
      else playerGravity = 0.0015;
    })();
    return <Player>{
      velocity: <Relativity>function (entities) {
        const 
          player = entities.player,
          velocity = entities.game.matterWorld.gravity.y * player.body.mass * playerGravity;
        BODY.applyForce(player.body, player.body.velocity, {
          x: 0,
          y: velocity
        });
      },
      gravity: (scale) => playerGravity = scale,
    }
  })();

  const wallRelativity = (() => { 
    let nextWall = 0;
    let possiblyFallingWall = false;

    return <Relativity>function (entities) {
      (function moveWalls() { 
        let wallLen = entities.game.wallIds.length, wallIndex, wall;
        while (wallLen--) {
          wallIndex = entities.game.wallIds[wallLen];
          wall = entities[wallIndex];
          BODY.translate( wall.body, { x: -3, y: 0 } );
        }
      })();

      (function isWallPassedByPlayer() { 
        const 
          currentWallid = entities.game.wallIds[nextWall],
          currentWall = entities[currentWallid],
          currentWallX = currentWall.body.position.x, 
          currentWallSize = currentWall.size[0],
          playerX = entities.player.body.position.x,
          playerSize = entities.player.size;

        if ((playerX - (playerSize/2)) > (currentWallX + (currentWallSize/2))) {
          const recentWallid = nextWall > 0 ? entities.game.wallIds[nextWall-1] : null;
          if (recentWallid === null || !entities[recentWallid]) {
            entities.game.setState({ score: entities.game.state.score + 1 });
            const
              playerX = entities.player.body.position.x,
              wallX = entities[entities.game.wallIds[1]].body.position.x;
            if (playerX < wallX) possiblyFallingWall = true;
          }
          nextWall++;
        }
      })();

      (function removeWall() { 
        if ( 
          entities.game.wallIds.length > 0 
          && 
          (function isWallOutOfVision() {
            const wallIndex = entities.game.wallIds[0], wall = entities[wallIndex];
            if ((wall.body.position.x + (wall.size[0] / 2)) < -getStatusBarHeight()) {
              COMPOSITE.remove(entities.game.matterWorld, wall.body);
              delete entities[wallIndex]; 
              return true;
            }
            return false;
          })()
        ){
          nextWall--;
          entities.game.wallFreedIds.push(entities.game.wallIds.splice(0, 1)[0]);
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
          if (percentLastDist >= WALL_DISTANCE) {
            Entities.following.getWalls(entities);
          }
        }
      })();

      (function isWallFalling() { 
        if ((entities.game.state.score > 0) && possiblyFallingWall && Math.random() > 0.3) {
          const 
            roofY = entities.roof.body.position.y,
            floorY = entities.floor.body.position.y,
            wall = entities[entities.game.wallIds[1]],
            wallY = wall.body.position.y,
            roof_and_Wall = wallY - roofY,
            floor_and_Wall = floorY - wallY;
          if (roof_and_Wall < floor_and_Wall) BODY.setStatic(wall.body, false);
          possiblyFallingWall = false;
        }
      })();
    }
  })();
  
  let collisionCallback: any;
  export const addCollisionListener: Event = (() => { 
    return function (game: FlappyBallGame) { 
      collisionCallback = (event: any) => {
        let pairs = event.pairs;
        if (pairs[0].bodyA.label === "Player-Circle") {
          const
            player = pairs[0].bodyA.label === "Player-Circle",
            playerFloorCollision = player && pairs[0].bodyB.label === "Floor-Rectangle",
            playerRoofCollision = player && pairs[0].bodyB.label === "Roof-Rectangle",
            playerWallCollision = player && pairs[0].bodyB.label === "Wall-Rectangle";
          if (playerFloorCollision || playerRoofCollision || playerWallCollision) {
            game.over = true;
            let timeOut: any;
            let callBack: any = () => {
              game.engine ? game.engine.stop() : null;
              (function collidedSprite() {
                game.grassRef.stop();
                game.roofRef.stop();
                game.playerRef.stopCurrentAnim();
                game.playerRef.setState({ startSprite: game.playerRef.collided });
              })();
              clearTimeout(timeOut);
              timeOut = null; callBack = null;
            }
            timeOut = setTimeout(callBack, 0);
          }
        }
      }
      EVENTS.on(game.matterEngine, 'collisionStart', collisionCallback);
    }
  })();

  export const removeCollisionListener = (game: FlappyBallGame) => {
    EVENTS.off(game.matterEngine, 'collisionStart', collisionCallback);
    collisionCallback = null;
  }
  
}
