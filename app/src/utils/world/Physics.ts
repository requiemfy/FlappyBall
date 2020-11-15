import { Bodies } from "matter-js";
import FlappyBallGame from "../..";
import { gameOverAlert } from "../helpers/alerts";
import { BODY, engine, world, ENGINE, EVENTS, COMPOSITE } from "./constants";
import { Entities } from './Entities';

export namespace Physics {

  type Physics = (entities: Entities.Initial, { time }: any) => Entities.Initial;
  type Event = (game: FlappyBallGame) => void;
  
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
  const wallRelativity = (entities: Entities.Initial) => {
    // sadly, i need to pass whole entities obj for the sake of pass by reference
    // so that i can delete an entity of it
    const isWallOutOfVision = () => {
      const wallIndex = entities.wall[0], wall = entities[wallIndex];
      // console.log("LAST WALL X: " + (wall.body.position.x + (wall.size[0] / 2)));
      if ((wall.body.position.x + (wall.size[0] / 2)) < 0) {
        COMPOSITE.remove(world, wall.body);
        delete entities[wallIndex]; // this is necessary
        return true;
      }
      return false;
    }

    var len = entities.wall.length, wallIndex, wall;
    const moveWalls = () => {
      if (len > 0) {
        wallIndex = entities.wall[len-1];
        wall = entities[wallIndex];
        len--;
        BODY.translate( wall.body, {x: -1, y: 0} );
        moveWalls();
      }
    }

    const removeWall = () => {
      if ( entities.wall.length > 0 && isWallOutOfVision()) {
        entities.wall.splice(0, 1); // remove wall id
      }
    }

    const showWall = () => {
      entities.distance++;
      if (entities.distance === 200) {
        Entities.getFollowing(entities) // wall
        entities.distance = 0;
      }
    }

    moveWalls();
    removeWall();
    showWall();
  }



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
      gameOverAlert();
      ////////////////////////////////////////////////////////////
      // console.log("\nindex.tsx:")
      // console.log("--------------------------");
      // console.log("STOPPING GAME ENGINE!! EXPECT RENDERING");
      // console.log("--------------------------\n");
      ////////////////////////////////////////////////////////////
    });
  }
  
}
