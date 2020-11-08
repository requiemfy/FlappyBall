import Box from "../../components/Box";
import { COMPOSITE, engine, world, BODY } from "./constants";
import { Matter } from "./Matter";
import { Body } from 'matter-js';
import FlappyBallGame from "../..";

export namespace Entities {
  type Physics = { 
    engine: typeof engine;
    world: typeof world ;
  }
  type Bodies = (matterBodies: { [key: string]: any }) => Game;
  type Recreation = (game: FlappyBallGame, dynamicBodies: number[][]) => void;

  export type Physical = {
    body: Body;
    size: number[]; 
    borderRadius: number;
    color: String; 
    renderer: typeof Box;
  }

  // used in index, physics
  export type Game = { 
    // indexable types
    [key: string]: Physical | Physics | number | String;
    [key: number]: Physical; // special purpose for wall
    // mandatory properties
    physics: Physics;
    player: Physical;
    floor: Physical;
    roof: Physical;
    gravity: number;
    nWall: number;
    counter: number;
  }

  export const get: Bodies = (matter) => {
    const 
      player = matter.player,
      floor = matter.floor,
      roof = matter.roof,
      entities = { 
        physics: { 
          engine: engine, 
          world: world 
        },
        player: { 
          body: player.body, 
          size: [player.width, player.height], 
          borderRadius: player.borderRadius,
          color: player.color, 
          renderer: Box,
        },
        floor: { 
          body: floor.body, 
          size: [floor.width, floor.height], 
          borderRadius: floor.borderRadius,
          color: floor.color, 
          renderer: Box,
        },
        roof: { 
          body: roof.body, 
          size: [roof.width, roof.height], 
          borderRadius: roof.borderRadius,
          color: roof.color, 
          renderer: Box,
        },
        gravity: 0.1,
        nWall: 0,
        counter: 0,
      }
    return entities;
  }

  // used in orientation change
  export const swap: Recreation = (game, dynamic) => {
    COMPOSITE.remove(world, game.entities.player.body);
    COMPOSITE.remove(world, game.entities.floor.body);
    COMPOSITE.remove(world, game.entities.roof.body);

    ////////////////////////////////////////////////////////////
    console.log("----------------------------------------------------");
    console.log("\t\tREMOVING BODIES...")
    console.log("--------------------------");
    console.log("WORLD BODIES: " + world.bodies.length);
    console.log("----------------------------------------------------\n\n");
    ////////////////////////////////////////////////////////////
    game.entities = get(Matter.get([...dynamic[0]]));
    game.engine.swap(game.entities);
  }
}
