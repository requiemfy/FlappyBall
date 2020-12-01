import Matter from 'matter-js';
import { Dimensions } from "react-native"
import { getStatusBarHeight } from 'react-native-status-bar-height';

// matter constants
const BODIES = Matter.Bodies,
      BODY = Matter.Body,
      ENGINE = Matter.Engine,
      RENDER = Matter.Render,
      WORLD = Matter.World,
      EVENTS = Matter.Events,
      COMPOSITE = Matter.Composite,
      engine = ENGINE.create({ enableSleeping:false } ),
      world = engine.world,
      
      { WINDOW_WIDTH, WINDOW_HEIGHT } = (() => { 
        const { width, height } = Dimensions.get("window");
        return  { WINDOW_WIDTH: width, WINDOW_HEIGHT: height };
      })(),

      { SCREEN_WIDTH, SCREEN_HEIGHT } = (() => { 
        const { width, height } = Dimensions.get("screen");
        return  { SCREEN_WIDTH: width, SCREEN_HEIGHT: height };
      })(),
      
      NAVBAR_HEIGHT = 50,

      // game window dimensions
      GAME_LANDSCAPE_HEIGHT = SCREEN_WIDTH - NAVBAR_HEIGHT,
      GAME_LANDSCAPE_WIDTH = SCREEN_HEIGHT,
      GAME_DIM_RATIO = GAME_LANDSCAPE_HEIGHT / GAME_LANDSCAPE_WIDTH, // getting game dim ratio - in landscape as fixed basis
      GAME_PORTRAIT_HEIGHT = SCREEN_HEIGHT - NAVBAR_HEIGHT,
      GAME_PORTRAIT_WIDTH = GAME_PORTRAIT_HEIGHT / GAME_DIM_RATIO,

      // soft key
      KEYS_HEIGHT = SCREEN_HEIGHT - (GAME_PORTRAIT_HEIGHT + getStatusBarHeight()),

      PLAYER_SIZE = 0.05,
      FLOOR_HEIGHT = (KEYS_HEIGHT / SCREEN_HEIGHT) + 0.05,
      ROOF_HEIGHT = 0.05,

      WALL_DISTANCE = 0.15,
      NOT_BODY = ["physics", "gravity", "wall", "distance",];

export {
  BODIES, BODY, ENGINE, RENDER, WORLD, EVENTS, COMPOSITE,
  
  engine, world,

  PLAYER_SIZE, FLOOR_HEIGHT, ROOF_HEIGHT, NAVBAR_HEIGHT,

  SCREEN_WIDTH, SCREEN_HEIGHT,

  GAME_LANDSCAPE_WIDTH, GAME_PORTRAIT_WIDTH,

  WALL_DISTANCE, NOT_BODY,
};