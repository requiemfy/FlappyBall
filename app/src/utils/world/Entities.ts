import Box from "../../components/Box";
import { COMPOSITE, engine, world, BODY, NOT_BODY } from "./constants";
import { Matter } from "./Matter";
import { Body } from 'matter-js';
import FlappyBallGame from "../..";
import Circle from "../../components/Circle";

export namespace Entities {
  type Physics = { 
    engine: typeof engine;
    world: typeof world ;
  }

  type Bodies = (
    game: FlappyBallGame, 
    dynamic?: InitialParams,
  ) => void;

  type Recreation = (
    game: FlappyBallGame, 
    dynamic: InitialParams, // yea, NOT optional
  ) => void;

  type Coordinates = { x: number, y: number };
  type InitialParams = { player: Coordinates };

  export type Physical = {
    body: Body;
    size: number[]; 
    borderRadius: number;
    color: String; 
    renderer: typeof Box;
  }

  // used in index, physics
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
          size: player.size,
          borderRadius: player.borderRadius,
          color: player.color, 
          renderer: Circle,
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

  // used in Physics.ts for wall
  // soon i may add more following entities
  export const getFollowing = (entities: any) => {
    showWall(entities);    
  }

  let wallPosition = "down";
  const showWall = (entities: any) => {
    // get the wall
    (() => {
      let wallEachTime = [1, 2],
          numOfwall = wallEachTime[Math.floor(Math.random()*2)];
      while (numOfwall--) {
        // extract the wall
        (() => {
          const 
            matter = Matter.getFollowing({ 
              wall: {
                position: wallPosition,
              } 
            }),
    
            wall = matter.wall,
            entity = {
              body: wall.body, 
              size: [wall.width, wall.height], 
              borderRadius: wall.borderRadius,
              color: wall.color, 
              renderer: Box,
            };
    
          let wallId = 0;
          while (entities.wall.includes(wallId)) {wallId++;}
          entities.wall.push(wallId);
          entities[wallId] = entity;
          if (wallPosition === "down") {wallPosition = "up";} 
          else {wallPosition = "down";}
        })();
      }
    })();
  }

  // used in orientation change
  export const swap: Recreation = (game, dynamic) => {
    // remove the current bodies
    for (let entity in game.entities) {
      if (!NOT_BODY.includes(entity)) {
        COMPOSITE.remove(world, game.entities[entity].body)
      }
    }
    ////////////////////////////////////////////////////////////
    console.log("----------------------------------------------------");
    console.log("\t\tREMOVING BODIES...")
    console.log("--------------------------");
    console.log("CURRENT WORLD BODIES: " + world.bodies.length);
    console.log("----------------------------------------------------\n\n");
    ////////////////////////////////////////////////////////////
    getInitial(game, dynamic);
    game.engine.swap(game.entities);
  }

}