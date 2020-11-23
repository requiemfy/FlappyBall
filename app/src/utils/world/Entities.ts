import Box from "../../components/Box";
import { COMPOSITE, engine, world, BODY, NOT_BODY, WALL_DISTANCE, GAME_LANDSCAPE_WIDTH, GAME_PORTRAIT_WIDTH } from "./constants";
import { Matter } from "./Matter";
import { Body } from 'matter-js';
import FlappyBallGame from "../..";
import Circle from "../../components/Circle";
import { GameDimension } from "../helpers/dimensions";
import { Coordinates } from "../helpers/Coordinates";

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
    dynamic: InitialParams & FollowingParams, // yea, NOT optional
  ) => void;
  type Coordinates = { x?: number, y?: number };
  type InitialParams = { player: Coordinates };
  type FollowingParams = { walls: Coordinates[], };
  type FollowingMethods = {
    getWalls: (entities: All, coords?: Coordinates) => void,
  };
  export type All = Initial & Following;
  export type Physical = {
    body: Body;
    size: number[]; 
    borderRadius: number;
    color: String; 
    renderer: typeof Box;
  }
  export type Following = {
    [key: number]: Physical; // following wall
  }
  export type Initial = { // used in index, physics
    [key: string]: any;
    [key: number]: Physical; // initial wall
    physics: Physics;
    player: Physical;
    floor: Physical;
    roof: Physical;
    gravity: number;
    wall: number[];
    counter: number; // testing purpose
  }

  export const getInitial: Bodies = (game, dynamic = { player: {} }) => {
    const
      player = Matter.getPlayer(dynamic.player), // player is auto extracted in Matter.ts
      floor = Matter.getFloor(),
      roof = Matter.getRoof(),

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
        wall: [], // same reason in gravity. this is array of wall ids
        distance: 0, // testing purpose
      }
    game.entities = entities;
    
    (function getInitialWalls(){
      if (!game.entitiesInitialized) {
        for (let wallNum = 8; wallNum--;) {
          if (game.entities.wall.length > 0) {
            const 
              lastWallX = Coordinates.getLastWallX(game.entities),
              distance = GameDimension.getWidth("now") * WALL_DISTANCE,
              newWallX = lastWallX - distance;
            following.getWalls(game.entities, { x: newWallX });
          }
          else following.getWalls(game.entities); // default x coords
        }
        game.entitiesInitialized = true;
      }
    })();
  }

  // this is object with methods for following entities
  // i just put together methods in an object for following entities
  // because unlike getInitials I can't just show following entities at once
  // soon i may add more following entities
  export const following: FollowingMethods = {
    getWalls: (() => {
      let wallPosition = "down",
          wallEachTime = [1, 2];
      return <typeof following.getWalls>function(entities, coords?) {
        let notDefault = coords !== undefined ? coords.y !== undefined : false;
        let numOfwall =  notDefault ? 1 : wallEachTime[Math.floor(Math.random()*2)]; // 1 wall only if not defualt creation
        while (numOfwall--) {
          (function getWall(){
            const 
              wall = Matter.getWall({ 
                ...coords,
                position: wallPosition, // this is disregarded if we have coords
              }),
              
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
            if (wallPosition === "down") wallPosition = "up";
            else wallPosition = "down";
          })();
        }
      }
    })(),
  }

  // used in orientation change
  // export const swap: Recreation = (game, dynamic) => {
  //   for (let entity in game.entities) {
  //     if (!NOT_BODY.includes(entity)) {
  //       COMPOSITE.remove(world, game.entities[entity].body);
  //     }
  //   }
  //   ////////////////////////////////////////////////////////////
  //   console.log("----------------------------------------------------");
  //   console.log("\t\tREMOVING BODIES...")
  //   console.log("--------------------------");
  //   console.log("CURRENT WORLD BODIES: " + world.bodies.length);
  //   console.log("----------------------------------------------------\n\n");
  //   ////////////////////////////////////////////////////////////
  //   const walls = dynamic.walls;
  //   getInitial(game, dynamic);
  //   for (let wall in walls) {
  //     following.getWalls(game.entities, walls[wall]);
  //   }
  //   game.engine.swap(game.entities);
  // }
  export const swap: Recreation = (() => {
    type args = {
      game: FlappyBallGame | any, 
      dynamic: InitialParams & FollowingParams | any,
      set: (game: any, dynamic: any) => void,
    };
    const params: args = {
      game: null,
      dynamic: null,
      set: function (game, dynamic) { this.game = game; this.dynamic = dynamic },
    }
    const removeAllEntities = () => {
      const game = params.game;
      for (let entity in game.entities) {
        if (!NOT_BODY.includes(entity)) COMPOSITE.remove(world, game.entities[entity].body);
      }
    }
    const getFollowing = () => {
      const [ game, walls ] = [ params.game, params.dynamic.walls ];
      for (let wall in walls) {
        following.getWalls(game.entities, walls[wall]);
      }
    }
    return <typeof swap>function (game, dynamic) {
      params.set(game, dynamic);
      removeAllEntities();
      ////////////////////////////////////////////////////////////
      console.log("----------------------------------------------------");
      console.log("\t\tREMOVING BODIES...")
      console.log("--------------------------");
      console.log("CURRENT WORLD BODIES: " + world.bodies.length);
      console.log("----------------------------------------------------\n\n");
      ////////////////////////////////////////////////////////////
      getInitial(game, dynamic);
      getFollowing();
      game.engine.swap(game.entities);
    }
  })();

}