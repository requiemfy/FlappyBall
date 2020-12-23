import Box from "../../components/Box";
import { COMPOSITE, engine, world, WALL_DISTANCE, ROOF_HEIGHT, FLOOR_HEIGHT, PLAYER_SIZE } from "./constants";
import { Matter } from "./Matter";
import { Body, use } from 'matter-js';
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
    getWalls: (entities: All, wallProps?: Coordinates & { heightPercent?: number, isStatic?: boolean }) => void,
  };

  export type All = Initial & Following & System;

  export type Physical<Size, HeightPercent> = {
    body: Body;
    size: Size;
    borderRadius: number;
    color: String; 
    heightPercent: HeightPercent; // this is especially for wall, because e.g. floor has CONSTANT percentage
    renderer: typeof Box | typeof Circle;
  }

  // ENTITIES THAT ARE INITIALIZED CONTINUOUSLY
  export type Following = {
    [key: number]: Physical<number[], number>; // following wall
  }

  // ENTITIES THAT ARE INITIALIZED AT ONCE
  export type Initial = {
    // [key: string]: any; // additional
    [key: number]: Physical<number[], number>; // initial wall
    player: Physical<number, undefined>;
    floor: Physical<number[], undefined>;
    roof: Physical<number[], undefined>;
  }

  // SYSTEM/PHYSICS ENTITIES
  export type System = {
    game: FlappyBallGame;
  }

  // ====================================================================================================
  // ====================================================================================================
  export const getInitial: Bodies = (game, dynamic = { player: {} }) => { // @note INSPECTED: good
    const
      player = Matter.getPlayer(dynamic.player), // player is auto extracted in Matter.ts
      floor = Matter.getFloor(),
      roof = Matter.getRoof();

      game.entities = <Initial & System>{
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
      };

    (function initNotBodyProps () {
      Object.defineProperty(
        game.entities, 'game', {
          value: game, 
          enumerable: false // special purpose for swap
      });
    })();

    (function resetGameSystemProps() {
      game.wallIds = [];
      // guess why free ids is not reset? becaaaause, it's not needed, since it will be used first again
    })();
    
    // setting initial wall entities with many times creations (depending on how many "wallNum")
    (function getInitialWalls(){ // @note INSPECTED: good
      if (!game.entitiesInitialized) { // EXECUTED EXACTLY ONCE (not even in swap)
        for (let wallNum = 3; wallNum--;) {
          if (game.wallIds.length > 0) {
            const 
              firstWallX = Coordinates.getFirstWallX(game.entities),
              distance = GameDimension.getWidth("now") * WALL_DISTANCE,
              newWallX = firstWallX - distance;
            following.getWalls(game.entities, { x: newWallX }); // default y only
          }
          else following.getWalls(game.entities); // default x, y coords
        }
        game.entitiesInitialized = true;
      }
    })();
    console.log("===================== GET INITIAL =====================");
  }
  // ====================================================================================================
  // ====================================================================================================


  // ====================================================================================================
  // ====================================================================================================
  // this is object with methods for following entities
  // i just put together methods in an object for "following entities"
  // because unlike getInitials I can't just show "following entities" at once, since it's continuous
  // soon i may add more following entities
  export const following: FollowingMethods = { // @note INSPECTED: bad
    getWalls: (() => { // wall/s can only be 1 or 2
      let wallPosition = "down",
          wallEachTime = [1, 2];

      const randomHeight = (n: 1 | 2) => { // @note INSPECTED: good
        const playerSpace = 0.06;
        if (n === 2) {
          const 
            min = 0.2, max = 0.8, // random num
            spaceBetween = (PLAYER_SIZE / 2) + (playerSpace / 2), // between wall
            trim = (ROOF_HEIGHT / 2) + (FLOOR_HEIGHT / 2) + spaceBetween;
          let 
            [ height1, height2 ] = (() => { 
              const rand = Math.random(); 
              let h1 = rand < min ? min : rand > max ? max : rand, h2 = 1 - h1;
              return [ h1, h2 ];
            })();
          return [ height1 - trim, height2 - trim ];
        }
        else return [ 1 - ROOF_HEIGHT - FLOOR_HEIGHT - PLAYER_SIZE - playerSpace ];
      }

      return <typeof following.getWalls>function(entities, wallProps?) { // wallProps for orientation especially
        let isDefault = !(wallProps && wallProps.y), // if wallProps is only x, then default wall: in this case y is only default, ctrl-f: default y only
            numOfwall = isDefault ? wallEachTime[Math.floor(Math.random()*2)] : 1, // 1 wall only if not defualt creation
            wallHeightsArr = isDefault ? randomHeight(numOfwall == 2 ? 2 : 1) : null; // param conditions is neccessary, to limit vals

        while (numOfwall--) { // how many walls are shown at a time (up or down or both)
          (function getWall(){ // @note INSPECTED: bad
            const 
              wall = Matter.getWall({ // @note INSPECTED: bad
                x: wallProps ? wallProps.x : void 0, // @remind
                y: wallProps ? wallProps.y : void 0,
                heightPercent: (() => {
                  // any of if conditions should be true, else throw error
                  // i can't find any proper way to do this, since either "wallProps" or "wallHeightsArr" is expected to be undefined
                  if (wallProps && wallProps.heightPercent) return wallProps.heightPercent; // height: number
                  else if (wallHeightsArr) return wallHeightsArr[numOfwall]; // if not null
                  else throw "Entities.ts: heightPercent is undefined which should not be.";
                })(),
                position: wallPosition, // this is disregarded if we have wallProps
                isStatic: wallProps?.isStatic, // @remind wtf is this?
              }),
              entity = { // extract wall props
                body: wall.body, 
                size: [wall.width, wall.height],
                heightPercent: wall.heightPercent,
                borderRadius: wall.borderRadius,
                color: wall.color, 
                renderer: Box,
              };
            
            (function setWallId() { // @note INSPECTED: good
              const 
                usedIds = entities.game.wallIds,
                wallId = (function choseWallId() { // @note INSPECTED: good
                  const freedIds = entities.game.wallFreedIds;
                  return (freedIds.length > 0) 
                    ? entities.game.wallFreedIds.splice(0, 1)[0] 
                    : (usedIds.length > 0) ? Math.max(...usedIds) + 1 : 0;
                })();

              (function saveWallId(){ // @note INSPECTED: good
                const lastWallX = (usedIds.length > 0) ? Coordinates.getEndWallX(entities) : void 0;
                (lastWallX && !(wall.body.position.x >= lastWallX) || !lastWallX)
                  ? entities.game.wallIds.unshift(wallId) // right to left creation (initial creation)
                  : entities.game.wallIds.push(wallId); // left to right creation (following / continuous creation)
              })();
              
              entities[wallId] = entity; // set id : value
              console.log("entities[wallId].body.position " + entities[wallId].body.position);
              console.log("wallId " + wallId);
            })();

            (function switchWallPos() { // @note INSPECTED: good
              (wallPosition === "down") ? wallPosition = "up" : wallPosition = "down";
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
  export const swap: Recreation = (() => { // @note INSPECTED: bad
    // @remind refactor this wtf, type not showing properly
    type args = {game?: FlappyBallGame | any, dynamic?: InitialParams & FollowingParams | any,};
    const params: args = {};

    const removeAllEntities = () => { // @note INSPECTED: good
      const game = params.game;
      for (let entity in game.entities) { COMPOSITE.remove(world, game.entities[entity].body) }
    }
    const getFollowing = () => { // @note INSPECTED: good
      // for now, following is only wall, but I may add more following entity
      const [ game, walls ] = [ params.game, params.dynamic.walls ];
      for (let wall in walls) {
        following.getWalls(game.entities, walls[wall]);
      }
    }
    return <typeof swap>function (game, dynamic) { // @note INSPECTED: good
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
      getInitial(game, dynamic); // only player, roof, floor
      getFollowing(); // following: walls, ...etc
      game.engine.swap(game.entities);
    }
  })();
  // ====================================================================================================
}