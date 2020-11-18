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
      BASE_HEIGHT = width > height ? width : height,
      BASE_WIDTH = width > height ? height : width,
      MAX_BASE_WIDTH = BASE_HEIGHT * 2, // this is the max width in landscape proportion
      GAME_DIM_RATIO = BASE_WIDTH / BASE_HEIGHT,

      WALL_DISTANCE = 0.10,
      NOT_BODY = ["physics", "gravity", "wall", "distance"];


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

  BASE_HEIGHT,
  BASE_WIDTH,
  MAX_BASE_WIDTH,
  GAME_DIM_RATIO,

  WALL_DISTANCE,
  NOT_BODY,
};