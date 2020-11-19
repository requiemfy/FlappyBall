import Matter from 'matter-js';
import { Dimensions } from "react-native"

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
      
      PLAYER_SIZE = 0.05,
      FLOOR_HEIGHT = 0.05,
      ROOF_HEIGHT = 0.05,
      NAVBAR_HEIGHT = 50,

      { width, height } = Dimensions.get("window"), 

      GAME_LANDSCAPE_HEIGHT = (width > height ? height : width) - NAVBAR_HEIGHT,
      GAME_LANDSCAPE_WIDTH = (width > height ? width : height),
      GAME_DIM_RATIO = GAME_LANDSCAPE_HEIGHT / GAME_LANDSCAPE_WIDTH, //@note getting game dim ratio - in landscape as fixed base
      GAME_PORTRAIT_HEIGHT = (width > height ? width : height) - NAVBAR_HEIGHT,
      GAME_PORTRAIT_WIDTH = GAME_PORTRAIT_HEIGHT / GAME_DIM_RATIO,

      WALL_DISTANCE = 0.10,
      NOT_BODY = ["physics", "gravity", "wall", "distance",];


export {
  BODIES,
  BODY,
  ENGINE,
  RENDER,
  WORLD,
  EVENTS,
  COMPOSITE,
  engine,
  world,

  PLAYER_SIZE,
  FLOOR_HEIGHT,
  ROOF_HEIGHT,
  NAVBAR_HEIGHT,

  // GAME_LANDSCAPE_HEIGHT,
  GAME_LANDSCAPE_WIDTH,
  // GAME_PORTRAIT_HEIGHT,
  GAME_PORTRAIT_WIDTH,
  GAME_DIM_RATIO,

  WALL_DISTANCE,
  NOT_BODY,
};