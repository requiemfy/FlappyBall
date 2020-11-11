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
    wallRelativity(entities); // impressive
    // //////////////////////////////////////////////////////////
    // entities.counter+=1; // this is on the entities script
    // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    // console.log("physics.tsx: COUNTER " + entities.counter);
    // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    // //////////////////////////////////////////////////////////
    ENGINE.update(engine, time.delta);
    return entities;
  };

  // special relativity
  const wallRelativity = (entities: Entities.Initial) => {
    for(let i = 0; i < entities.wall.length; i++) {
      const
        wallIndex = entities.wall[i],
        wall = entities[wallIndex];
      BODY.translate( wall.body, {x: -1, y: 0} );
      if (isWallOutOfVision(entities, wallIndex)) {
        entities.wall.splice(i, 1);
        i--;
      }
    }
  }

  // sadly, i need to pass whole entities obj for the sake of pass by reference
  // so that i can delete an entity of it
  const isWallOutOfVision = (entities: Entities.Initial, wallIndex:number) => {
    const wall = entities[wallIndex];
    // console.log("LAST WALL X: " + (wall.body.position.x + (wall.size[0] / 2)));
    if ((wall.body.position.x + (wall.size[0] / 2)) < 0) {
      COMPOSITE.remove(world, wall.body);
      delete entities[wallIndex]; // this is necessary
      return true;
    }
    return false;
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
