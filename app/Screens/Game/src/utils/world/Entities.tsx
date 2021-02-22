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
    renderer: typeof Box | typeof Player;
  };
  export type Following = {
    [key: number]: Physical<number[]> & { heightPercent: number };
  };
  export type Initial = {
    [key: number]: Physical<number[]> & { heightPercent: number };
    player: Physical<number> & { setRef: (ref: any) => void };
    floor: Physical<number[]> & { setRef: (ref: any) => void };
    roof: Physical<number[]> & { setRef: (ref: any) => void };
  };
  export const getInitial: Bodies = (game, dynamic = { player: {} }) => {
    const
      player = Matter.getPlayer(game, dynamic.player),
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
    })();
    
    (function getInitialWalls(){
      if (!game.entitiesInitialized) {
        for (let wallNum = 3; wallNum--;) {
          if (game.wallIds.length > 0) {
            const 
              firstWallX = Coordinates.getFirstWallX(game.entities),
              distance = GameDimension.getWidth("now") * WALL_DISTANCE,
              newWallX = firstWallX - distance;
            following.getWalls(game.entities, { x: newWallX });
          }
          else following.getWalls(game.entities);
        }
        game.entitiesInitialized = true;
      }
    })();
  }

  export const following: FollowingMethods = {
    getWalls: (() => {
      let wallPosition = "down",
          wallEachTime = [1, 2];

      const randomHeight = (n: 1 | 2) => {
        const playerSpace = 0.06;
        if (n === 2) {
          const 
            min = 0.2, max = 0.8,
            spaceBetween = (PLAYER_SIZE / 2) + (playerSpace / 2),
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

      return (function(entities, wallProps?) { 
        let isDefault = !(wallProps && wallProps.y), 
            numOfwall = isDefault ? wallEachTime[Math.floor(Math.random()*2)] : 1,
            wallHeightsArr = isDefault ? randomHeight(numOfwall == 2 ? 2 : 1) : null;

        while (numOfwall--) {
          (function getWall(){
            const 
              wall = Matter.getWall(entities.game, {
                x: wallProps?.x,
                y: wallProps?.y,
                heightPercent: (() => {
                  if (wallProps && wallProps.heightPercent) return wallProps.heightPercent;
                  else if (wallHeightsArr) return wallHeightsArr[numOfwall];
                })(),
                position: wallPosition,
                isStatic: wallProps?.isStatic,
              }),
              entity: Physical<number[]> & { heightPercent: number } = {
                body: wall.body, 
                size: [wall.width, wall.height],
                heightPercent: wall.heightPercent,
                borderRadius: wall.borderRadius,
                color: wall.color, 
                renderer: Box,
              };
            
            (function setWallId() {
              const 
                usedIds = entities.game.wallIds,
                wallId = (function choseWallId() {
                  const freedIds = entities.game.wallFreedIds;
                  return (freedIds.length > 0) 
                    ? entities.game.wallFreedIds.splice(0, 1)[0] 
                    : (usedIds.length > 0) ? Math.max(...usedIds) + 1 : 0;
                })();
              (function saveWallId(){
                const lastWallX = (usedIds.length > 0) ? Coordinates.getEndWallX(entities) : void 0;
                (lastWallX && !(wall.body.position.x >= lastWallX) || !lastWallX)
                  ? entities.game.wallIds.unshift(wallId)
                  : entities.game.wallIds.push(wallId);
              })();
              entities[wallId] = entity;
            })();

            (function switchWallPos() {
              (wallPosition === "down") ? wallPosition = "up" : wallPosition = "down";
            })();
          })();
        }
      } as typeof following.getWalls)
    })(),
  }
  
  export const swap: Recreation = (() => {
    let game!: FlappyBallGame, dynamic: InitialParams & FollowingParams | undefined; 
    const removeAllEntities = () => {
      for (let entity in game.entities) { 
        COMPOSITE.remove(game.matterWorld, game.entities[entity].body);
      }
    }
    const getFollowing = () => {
      const walls = dynamic?.walls;
      if (walls) for (let wall in walls) {following.getWalls(game.entities, walls[wall]);}
    }

    return (function (paramGame, paramDynamic) {
      (function getParams() {
        game = paramGame;
        dynamic = paramDynamic;
      })();
      removeAllEntities();
      (function setEntities() {
        getInitial(game, dynamic);
        dynamic ? getFollowing() : null;
      })();
      game.engine.swap(game.entities);
    } as typeof swap)
  })();
  // ====================================================================================================
}