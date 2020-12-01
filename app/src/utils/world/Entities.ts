import Box from "../../components/Box";
import { COMPOSITE, engine, world, BODY, NOT_BODY, WALL_DISTANCE, GAME_LANDSCAPE_WIDTH, GAME_PORTRAIT_WIDTH } from "./constants";
import { Matter } from "./Matter";
import { Body } from 'matter-js';
import FlappyBallGame from "../..";
import Circle from "../../components/Circle";
import { GameDimension } from "../helpers/dimensions";
import { Coordinates } from "../helpers/coordinates";

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
    getWalls: (entities: All, wallProps?: Coordinates & { heightPercent?: number }) => void,
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
            following.getWalls(game.entities, { x: newWallX }); // default y only
          }
          else following.getWalls(game.entities); // default x, y coords
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
    getWalls: (() => { // wall/s can only be 1 or 2
      const randomHeight = (() => {
        const random = () => {
          const rand = Math.random();
          if (rand > 0.4) return rand - 0.4; // 0.4 -> 0.3 = player, 0.1 = wall
          else return rand;
        }
        return (n: 1 | 2) => {
          if (n === 2) { // if 2 walls, random 2 height
            const 
              height1 = random(), 
              height2 = (1 - height1) - 0.3;
            return [ height1, height2 ];
          }
          else return [ random() ]; // else 1 wall, random 1 height
        }
      })();

      // const extractProps = (wallProps?: any, randomHeight?: any) => { // @remind refactor this bullshit
      //   let x, y, heightPercent
      //   if (wallProps !== undefined) {
      //     x = wallProps.x ? wallProps.x : undefined;
      //     y = wallProps.y ? wallProps.y : undefined;
      //     heightPercent = wallProps.heightPercent ? wallProps.heightPercent : randomHeight;
      //     return { x: x, y: y, heightPercent: heightPercent };
      //   } else {
      //     return { x: undefined, y: undefined, heightPercent: randomHeight }
      //   }
      // } 

      let wallPosition = "down",
          wallEachTime = [1, 2];

      return <typeof following.getWalls>function(entities, wallProps?) { // wallProps for orientation
        // this won't work: let notDefault = wallProps.y !== undefined ? true : false;
        // @remind refactor notDefault conditions, so ugly
        let notDefault = wallProps !== undefined ? wallProps.y !== undefined : false, // if wallProps is only x, then not default wall, ctrl-f: default y only
            numOfwall = notDefault ? 1 : wallEachTime[Math.floor(Math.random()*2)], // 1 wall only if not defualt creation
            wallHeightsArr = randomHeight(numOfwall == 2 ? 2 : 1); // @remind wtf is this param
            // wallHeightsArr = [ 0.3146822198920567, 0.5187763966772423]; // @remind delete

        while (numOfwall--) { // how many walls are shown at a time (up or down or both)
          (function getWall(){
            const 
              wall = Matter.getWall({ // @audit problem, wallProps as only arg
                // ...wallProps,
                // heightPercent: wallHeightsArr[0],

                // x: wallProps ? wallProps.x ? wallProps.x : undefined : undefined,
                // y: wallProps ? wallProps.y ? wallProps.y : undefined : undefined,
                // heightPercent: wallProps ? wallProps.heightPercent ? 
                //                 wallProps.heightPercent : wallHeightsArr[numOfwall] : wallHeightsArr[numOfwall],

                x: wallProps ? wallProps.x : undefined,
                y: wallProps ? wallProps.y : undefined,
                heightPercent: (() => { // this can't be undefined
                  if (wallProps && wallProps.heightPercent) return wallProps.heightPercent;
                  else return wallHeightsArr[numOfwall];
                })(),


                // heightPercent: (() => { // default random height or pre defined height
                //   if (wallProps !== undefined)
                //     if (wallProps.heightPercent === undefined) return wallHeightsArr[numOfwall]; 
                //   console.log("default height");
                //   return;
                // })(),
                
                position: wallPosition, // this is disregarded if we have wallProps
              }),
              
              // walls must return these props
              entity = {
                body: wall.body, 
                size: [wall.width, wall.height],
                heightPercent: wall.heightPercent,
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

  // this swap is used in orientation
  // idea: remove all current entities, then create new ones
  //       bodies / objects created will auto adjust to current window dimension
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
      getFollowing(); // following: walls, ...etc
      game.engine.swap(game.entities);
    }
  })();

}