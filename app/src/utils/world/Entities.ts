import Box from "../../components/Box";
import { COMPOSITE, engine, world, BODY, NOT_BODY, BASE_WIDTH, MAX_BASE_WIDTH, WALL_DISTANCE } from "./constants";
import { Matter } from "./Matter";
import { Body } from 'matter-js';
import FlappyBallGame from "../..";
import Circle from "../../components/Circle";
import window, { getOrientation } from "../helpers/dimensions";

export namespace Entities {
  export type All = Initial & Following;
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
    dynamic: InitialParams & FollowingParams, // yea, NOT optional
  ) => void;

  type Coordinates = { x?: number, y?: number };
  type InitialParams = { player: Coordinates };
  type FollowingParams = { walls: Coordinates[], };

  export type Physical = {
    body: Body;
    size: number[]; 
    borderRadius: number;
    color: String; 
    renderer: typeof Box;
  }

  export type Following = {
    [key: number]: Physical; // special purpose for wall
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
        // floor: { 
        //   body: floor.body, 
        //   size: [floor.width, floor.height], 
        //   borderRadius: floor.borderRadius,
        //   color: floor.color, 
        //   renderer: Box,
        // },
        // roof: { 
        //   body: roof.body, 
        //   size: [roof.width, roof.height], 
        //   borderRadius: roof.borderRadius,
        //   color: roof.color, 
        //   renderer: Box,
        // },
        gravity: 0.1, // because, we can pass this in physics, and i donno how to pass custom props in system
        wall: [], // same reason in gravity. this is array of wall ids
        distance: 0, // testing purpose
      }
    game.entities = entities;
    
    // special case, adding initial walls
    for (let wallNum = 8; wallNum--;) {
      console.log("create wall wall wall wall")
      if (game.entities.wall.length > 0) {
        //@remind refactor this way of getting wall redundant
        //@audit-info check GAME_DIM_RATIO here
        const wallCount = game.entities.wall.length,
              wallIndex = game.entities.wall[wallCount-1],
              firstWallX = game.entities[wallIndex].body.position.x,
              //@remind refactor this redundant distance percent, also in physics.ts
              { width, height } = window(),
              gameWidth = getOrientation(width, height) === "landscape" ?
                          width : MAX_BASE_WIDTH,
              distance = gameWidth * WALL_DISTANCE,
              newWallX = firstWallX - distance;

        console.log("first wall x: " + firstWallX);
        
        getFollowing.walls(game.entities, { x: newWallX });
      }
      else getFollowing.walls(game.entities);
    }
  }

  // used in Physics.ts for wall
  // soon i may add more following entities
  // export const getFollowing = (entities: any) => {
  //   showWall(entities);    
  // }
  export const getFollowing = {
    // walls: (entities: All) => showWall(entities),
    walls: (() => {
      let wallPosition = "down",
          wallEachTime = [1, 2];
      return function (entities: All, coords?: Coordinates) {
        let numOfwall = wallEachTime[Math.floor(Math.random()*2)];
        while (numOfwall--) {
          (function getWall(){
            const 
              matter = Matter.getFollowing({ 
                wall: {
                  ...coords,
                  position: wallPosition, // this is disregarded if we have coords
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
      
            // record the wall id
            let wallId = 0;
            while (entities.wall.includes(wallId)) {wallId++;}
            entities.wall.push(wallId);
            entities[wallId] = entity;
            if (wallPosition === "down") {wallPosition = "up";} 
            else {wallPosition = "down";}
          })();
        }
      }
    })(),
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
    const player = { player: dynamic.player },
          walls = dynamic.walls;
    getInitial(game, dynamic);
    for (let wall in walls) {
      getFollowing.walls(game.entities, walls[wall]);
    }

    game.engine.swap(game.entities);
  }

}