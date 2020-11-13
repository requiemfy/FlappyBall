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

  // matterBodies: { [key: string]: any }
  // type Bodies = () => Initial;
  type Bodies = (
    game: FlappyBallGame, 
    coords?: { 
      player: number[],
      // walls: number[][] | null[] 
    }
  ) => void;

  // type Recreation = (game: FlappyBallGame, dynamic: number[][]) => void;
  type Recreation = (
    game: FlappyBallGame, 
    dynamic: { 
      player: number[], 
      // walls: number[][] | null[] 
    },
  ) => void;

  export type Physical = {
    body: Body;
    size: number[]; 
    borderRadius: number;
    color: String; 
    renderer: typeof Box;
  }

  // used in index, physics
  // initial entities
  export type Initial = { 
    // indexable types
    [key: string]: any;
    [key: number]: Physical; // special purpose for wall
    // mandatory properties
    physics: Physics;
    player: Physical;
    floor: Physical;
    roof: Physical;
    gravity: number;
    wall: number[];
    counter: number; // testing purpose
  }






  export const getInitial: Bodies = (game, dynamic) => {
    const
      matter = Matter.getInitial(dynamic),
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
        gravity: 0.1, // because, we can pass this in physics, and i donno how to pass custom props in system
        wall: [], // same reason in gravity
        distance: 0, // testing purpose
      }
    game.entities = entities;
  }










  // export const getFollowing = (game: any) => {
  //   showWalls(game);    
  // }
  export const getFollowing = (entities: any) => {
    showWalls(entities);    
  }

  // const showWalls = (game: any) => {
  const showWalls = (entities: any) => {

    const 
      matter = Matter.getFollowing(),
      wall = matter.wall,
      entity = {
        body: wall.body, 
        size: [wall.width, wall.height], 
        borderRadius: wall.borderRadius,
        color: wall.color, 
        renderer: Box,
      };

    // choosing unique wall id here
    let wallId = 0;
    // while (game.entities.wall.includes(wallId)) {wallId++;}
    // game.entities.wall.push(wallId);
    // game.entities[wallId] = entity;

    while (entities.wall.includes(wallId)) {wallId++;}
    entities.wall.push(wallId);
    entities[wallId] = entity;
    
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
    getInitial(game, dynamic);
    game.engine.swap(game.entities);
  }

}