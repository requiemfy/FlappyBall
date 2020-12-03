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

  export type All = Initial & Following & SystemProps;

  export type Physical = {
    body: Body;
    size: number[]; 
    borderRadius: number;
    color: String; 
    renderer: typeof Box | typeof Circle;
  }

  // ******* ALWAYS REMEMBER WHEN UPDATING ENTITIES, UPDATE "NOT_BODY" CONSTANT *******

  // ENTITIES THAT ARE INITIALIZED CONTINUOUSLY
  export type Following = {
    [key: number]: Physical; // following wall
  }

  // ENTITIES THAT ARE INITIALIZED AT ONCE
  export type Initial = {
    // [key: string]: any; // additional
    [key: number]: Physical; // initial wall
    player: Physical;
    floor: Physical;
    roof: Physical;
  }

  // ENTITIES THAT ARE NON PHYSICAL
  export type SystemProps = {
    physics: Physics;
    gravity: number;
    wall: number[]; // actually this is wall ids array
    wallInLastPos: number;
  }

  // ====================================================================================================
  // ====================================================================================================
  export const getInitial: Bodies = (game, dynamic = { player: {} }) => {
    const
      player = Matter.getPlayer(dynamic.player), // player is auto extracted in Matter.ts
      floor = Matter.getFloor(),
      roof = Matter.getRoof(),

      // setting initial entities with one time creation
      entities: Initial & SystemProps = { 
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
        gravity: 0.1, 
        wall: [],
        wallInLastPos: 0,      
      }
    game.entities = entities;
    
    // setting initial wall entities with many times creations (depending on how many "wallNum")
    (function getInitialWalls(){
      if (!game.entitiesInitialized) {
        for (let wallNum = 3; wallNum--;) {
          if (game.entities.wall.length > 0) {
            const 
              latestWallX = Coordinates.getLatestWallX(game.entities),
              distance = GameDimension.getWidth("now") * WALL_DISTANCE,
              newWallX = latestWallX - distance;
            following.getWalls(game.entities, { x: newWallX }); // default y only
          }
          else following.getWalls(game.entities); // default x, y coords
        }
        game.entitiesInitialized = true;
      }
    })();
  }
  // ====================================================================================================
  // ====================================================================================================


  // ====================================================================================================
  // ====================================================================================================
  // this is object with methods for following entities
  // i just put together methods in an object for "following entities"
  // because unlike getInitials I can't just show "following entities" at once, since it's continuous
  // soon i may add more following entities
  export const following: FollowingMethods = {
    getWalls: (() => { // wall/s can only be 1 or 2
      let wallPosition = "down",
          wallEachTime = [1, 2];

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
          else return [ 0.7 ]; // else 1 wall, specific height
        }
      })();

      return <typeof following.getWalls>function(entities, wallProps?) { // wallProps for orientation especially
        let isDefault = !(wallProps && wallProps.y), // if wallProps is only x, then default wall, ctrl-f: default y only
            numOfwall = isDefault ? wallEachTime[Math.floor(Math.random()*2)] : 1, // 1 wall only if not defualt creation
            wallHeightsArr = isDefault ? randomHeight(numOfwall == 2 ? 2 : 1) : null; // param conditions is neccessary, to limit vals

        while (numOfwall--) { // how many walls are shown at a time (up or down or both)
          (function getWall(){
            const 
              wall = Matter.getWall({
                x: wallProps ? wallProps.x : undefined,
                y: wallProps ? wallProps.y : undefined,
                heightPercent: (() => { // this can't be undefined
                  // any of this conditions should be true
                  if (wallProps && wallProps.heightPercent) return wallProps.heightPercent;
                  else if (wallHeightsArr) return wallHeightsArr[numOfwall]; // if not null
                })(),
                position: wallPosition, // this is disregarded if we have wallProps
              }),
              
              entity = { // extract wall props
                body: wall.body, 
                size: [wall.width, wall.height],
                heightPercent: wall.heightPercent,
                borderRadius: wall.borderRadius,
                color: wall.color, 
                renderer: Box,
              };
            
            const wallId = (function getWallId() {
              let _wallId = 0;
              while (entities.wall.includes(_wallId)) { _wallId++; } // choose unique id
              entities.wall.push(_wallId); // record the id
              entities[_wallId] = entity; // set id : value
              return _wallId;
            })();

            (function setWallInLastPosition() { // to record the id of wall in the last position, for monitoring its distance for showing the next wall
              const
                latestWallX = Coordinates.getLatestWallX(entities),
                prevWallX = entities[entities.wallInLastPos].body.position.x;
              if ( latestWallX >= prevWallX) { // of course, new added wall supposed to be has the heighest distance
                entities.wallInLastPos = wallId;
                console.log("entities.wallInLastPos: " + entities.wallInLastPos);
              }
            })();
             
            (function switchWallPos() {
              if (wallPosition === "down") wallPosition = "up";
              else wallPosition = "down";
            })();
          })();
        }
      }
    })(),
  }
  // ====================================================================================================
  // ====================================================================================================

  
  // ====================================================================================================
  // ====================================================================================================
  // this swap is used in orientation
  // idea: remove all current entities, then create new ones
  //       bodies / objects created will auto adjust to current window dimension
  export const swap: Recreation = (() => {
    type args = {
      game?: FlappyBallGame | any, 
      dynamic?: InitialParams & FollowingParams | any,
    };
    const params: args = {};

    const removeAllEntities = () => {
      const game = params.game;
      for (let entity in game.entities) {
        if (!NOT_BODY.includes(entity)) COMPOSITE.remove(world, game.entities[entity].body);
      }
    }
    const getFollowing = () => { // for now, following is only wall, but I may add more following entity
      const [ game, walls ] = [ params.game, params.dynamic.walls ];
      for (let wall in walls) {
        following.getWalls(game.entities, walls[wall]);
      }
    }
    return <typeof swap>function (game, dynamic) {
      Object.defineProperty(params, "game", { get() { return game }, configurable: true });
      Object.defineProperty(params, "dynamic", { get() { return dynamic }, configurable: true });
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
  // ====================================================================================================
}