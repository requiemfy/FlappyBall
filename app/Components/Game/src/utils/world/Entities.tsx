import React from 'react';
import Box from "../../components/shapes/Box";
import Grass from "../../components/Grass";
import { 
  COMPOSITE, 
  // engine, 
  // world, 
  WALL_DISTANCE, 
  ROOF_HEIGHT, 
  FLOOR_HEIGHT, 
  PLAYER_SIZE 
} from "./constants";
import { Matter } from "./Matter";
import { Body, use } from 'matter-js';
import FlappyBallGame from "../..";
import Circle from "../../components/shapes/Circle";
import Player from '../../components/Player'
import { GameDimension } from "../helpers/dimensions";
import { Coordinates } from "../helpers/coordinates";
import Roof from '../../components/Roof';

export namespace Entities {
  type Bodies = (
    game: FlappyBallGame, 
    dynamic?: InitialParams,
  ) => void;
  type Recreation = (
    game: FlappyBallGame, 
    dynamic?: InitialParams & FollowingParams
  ) => void;
  type Coordinates = { x?: number; y?: number };
  type InitialParams = { player: Coordinates };
  type FollowingParams = { walls: Coordinates[], };
  type FollowingMethods = {
    getWalls: (entities: All, wallProps?: Coordinates & { heightPercent?: number, isStatic?: boolean }) => void,
  };

  export type All = Initial & Following & { game: FlappyBallGame };

  export type Physical<Size> = {
    body: Body;
    size: Size;
    borderRadius: number;
    color: String; 
    renderer: typeof Box | typeof Player; // @remind update (grass roof)
  };

  // ENTITIES THAT ARE INITIALIZED CONTINUOUSLY
  export type Following = {
    [key: number]: Physical<number[]> & { heightPercent: number }; // following wall
  };

  // ENTITIES THAT ARE INITIALIZED AT ONCE
  export type Initial = {
    // [key: string]: any; // additional
    [key: number]: Physical<number[]> & { heightPercent: number }; // initial wall
    player: Physical<number> & { setRef: (ref: any) => void };
    floor: Physical<number[]> & { setRef: (ref: any) => void };
    roof: Physical<number[]> & { setRef: (ref: any) => void };
  };

  // ====================================================================================================
  // ====================================================================================================
  export const getInitial: Bodies = (game, dynamic = { player: {} }) => { // @note INSPECTED: good
    const
      player = Matter.getPlayer(game, dynamic.player), // player is auto extracted in Matter.ts
      floor = Matter.getFloor(game),
      roof = Matter.getRoof(game);

      game.entities = {
        player: {
          body: player.body, 
          size: player.size,
          borderRadius: player.borderRadius,
          color: player.color, 
          setRef: ref => game.playerRef = ref,
          renderer: Player
        },
        floor: { 
          body: floor.body, 
          size: [floor.width, floor.height], 
          borderRadius: floor.borderRadius,
          color: floor.color, 
          setRef: ref => game.grassRef = ref,
          renderer: Grass,
        },
        roof: { 
          body: roof.body, 
          size: [roof.width, roof.height], 
          borderRadius: roof.borderRadius,
          color: roof.color, 
          setRef: ref => game.roofRef = ref,
          renderer: Roof,
        },
        game: game,
      };

    (function makeNotEnumerable () {
      Object.defineProperty(game.entities, 'game', { enumerable: false });
    })();

    (function resetGameSystemProps() {
      game.wallIds = [];
      // guess why free ids is not reset? becaaaause, it's not needed, since it will be used first again
    })();
    
    // setting initial wall entities with many times creations (depending on how many "wallNum")
    (function getInitialWalls(){ // @note INSPECTED: good
      if (!game.entitiesInitialized) { // EXECUTED EXACTLY ONCE (not even in swap)
        for (let wallNum = 0; wallNum--;) { // @remind number of wall
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
  export const following: FollowingMethods = { // @note INSPECTED: good
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

      return (function(entities, wallProps?) { // wallProps for orientation especially
        let isDefault = !(wallProps && wallProps.y), // if wallProps is only x, then default wall: in this case y is only default, ctrl-f: default y only
            numOfwall = isDefault ? wallEachTime[Math.floor(Math.random()*2)] : 1, // 1 wall only if not defualt creation
            wallHeightsArr = isDefault ? randomHeight(numOfwall == 2 ? 2 : 1) : null; // param conditions is neccessary, to limit vals

        while (numOfwall--) { // how many walls are shown at a time (up or down or both)
          (function getWall(){ // @note INSPECTED: good
            const 
              wall = Matter.getWall(entities.game, { // @note INSPECTED: good
                x: wallProps?.x,
                y: wallProps?.y,
                heightPercent: (() => {
                  // any of if conditions should be true, else throw error
                  // i can't find any proper way to do this, since either "wallProps" or "wallHeightsArr" is expected to be undefined
                  if (wallProps && wallProps.heightPercent) return wallProps.heightPercent; // height: number
                  else if (wallHeightsArr) return wallHeightsArr[numOfwall]; // if not null
                  // else throw "Entities.ts: heightPercent is undefined which should not be.";
                })(),
                position: wallPosition, // this is disregarded if we have wallProps
                isStatic: wallProps?.isStatic,
              }),
              entity: Physical<number[]> & { heightPercent: number } = { // extract wall props
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
      } as typeof following.getWalls)
    })(),
  }
  // ====================================================================================================
  // ====================================================================================================

  
  // ====================================================================================================
  // ====================================================================================================
  // this swap is used in orientation
  // idea: remove all current entities, then create new ones
  //       bodies / objects created will auto adjust to current window dimension
  export const swap: Recreation = (() => { // @note INSPECTED: good
      let game!: FlappyBallGame, dynamic: InitialParams & FollowingParams | undefined; 

      const removeAllEntities = () => { // @note INSPECTED: good
        for (let entity in game.entities) { 
          COMPOSITE.remove(game.matterWorld, game.entities[entity].body);
          // delete game.entities[entity]; // i guess this is not needed, since id are still reused in creation
          // my question is, why in swapping, entities are not getting unmounted?? even deleting it
        }
      }
      const getFollowing = () => { // @note INSPECTED: good
        // for now, following is only wall, but I may add more following entity
        const walls = dynamic?.walls;
        if (walls) for (let wall in walls) {following.getWalls(game.entities, walls[wall]);}
      }

    return (function (paramGame, paramDynamic) { // @note INSPECTED: good
      (function getParams() {
        game = paramGame;
        dynamic = paramDynamic;
      })();

      removeAllEntities();

      ////////////////////////////////////////////////////////////
      console.log("----------------------------------------------------");
      console.log("\t\tREMOVING BODIES...")
      console.log("--------------------------");
      console.log("CURRENT WORLD BODIES: " + game.matterWorld.bodies.length);
      console.log("----------------------------------------------------\n\n");
      ////////////////////////////////////////////////////////////

      // mutate game entities object
      (function setEntities() {
        getInitial(game, dynamic); // only player, roof, floor
        dynamic ? getFollowing() : null; // following: walls, ...etc
      })();

      game.engine.swap(game.entities); // if swap() went error, edit GameEngine definition file (.d.ts)
    } as typeof swap)
  })();
  // ====================================================================================================
}