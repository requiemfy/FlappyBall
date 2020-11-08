import Matter from 'matter-js';

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
      NAVBAR_HEIGHT = 50;

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
};