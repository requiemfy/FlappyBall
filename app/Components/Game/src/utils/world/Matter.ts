import { 
  BODIES, 
  PLAYER_SIZE, 
  FLOOR_HEIGHT, 
  ROOF_HEIGHT, 
  world, 
  WORLD, 
  GAME_LANDSCAPE_WIDTH,
  GAME_PORTRAIT_WIDTH,
} from "./constants";
import { GameDimension } from "../helpers/dimensions";
import { getStatusBarHeight } from "react-native-status-bar-height";

export namespace Matter {
  type Coordinates = {x?: number, y?:number};
  type MatterProps = { [key: string]: any };
  type Body = (matter: MatterProps) => MatterProps
  type WallPos = keyof { up: string, down: string};
  type WallParams = Coordinates & { height?: number, position?: WallPos };
  type StaticBody = (params: WallParams | any) => MatterProps; // object is required, but params are optional
  type DynamicBody = (center: Coordinates) => MatterProps;  // center obj is required but x, y props is optional LOL

  // ==================================== Entities ===================================
  const createPlayer: DynamicBody = ({ x, y }) => {
    const
      { gameHeight } = GameDimension.window(),
      playerBaseSize = gameHeight * PLAYER_SIZE;
    if (!y) { y = gameHeight * 0.35; }
    if (!x) { x = gameHeight * 0.05; }

    return createCircle ({
      x: x,
      y: y,
      size: playerBaseSize,
      borderRadius: playerBaseSize / 2,
      color: "red",
      label: "Player Circle",
      static: false,
    });
  }
  
  const createFloor: StaticBody = () => {
    const 
      // NOTE: matter js CENTER x, y works differently.
      // Observe centerX, which is half of screen width
      // but we didn't explicity minus the half of floor width to it to fit the floor
      { windowWidth, windowHeight, gameHeight } = GameDimension.window(),
      [ floorWidth, floorHeight ] = [ windowWidth + (getStatusBarHeight() * 2), gameHeight * FLOOR_HEIGHT ],
      [ centerX, centerY ] = [ windowWidth / 2, gameHeight - (floorHeight / 2) ]
    ////////////////////////////////////////////////////////////
    console.log("\nmatter.tsx: ");
    console.log("=========== ============== ===========");
    console.log("CREATING FLOOR");
    console.log("\tDimensions width: " + windowWidth)
    console.log("\tDimensions height: " + windowHeight)
    ////////////////////////////////////////////////////////////
    return createRectangle ({
      x: centerX,
      y: centerY,
      width: floorWidth,
      height: floorHeight,
      borderRadius: 0,
      color: "green",
      label: "Floor Rectangle",
      static: true,
    });
  }
  
  const createRoof: StaticBody = () => {
    const 
      { windowWidth, gameHeight } = GameDimension.window(),
      [ roofWidth, roofHeight ] = [ windowWidth + (getStatusBarHeight() * 2), gameHeight * ROOF_HEIGHT ],
      [ centerX, centerY ] = [ windowWidth / 2, roofHeight / 2 ];
    return createRectangle ({
      x: centerX,
      y: centerY,
      width: roofWidth,
      height: roofHeight,
      borderRadius: 0,
      color: "brown",
      label: "Roof Rectangle",
      static: true,
    });
  }

  // possible cases of coordinates:
  //    x defined, y undefined -> showing walls initially (Initial Entity Wall), based on previous wall's x
  //    x and y are both defined -> showing walls with specific coords, triggered by orientation
  //    x and y are both undefined -> showing walls by default: coords are purely based on game dimensions
  const createWall: StaticBody = ({ x, y, heightPercent, position }) => { // @note INSPECTED: good
    const 
      { windowWidth, windowHeight, gameHeight } = GameDimension.window(), // gameHeight is auto update
      [ wallWidth, wallHeight ] = [ gameHeight * 0.07, gameHeight * heightPercent ]; 
    // i can't put these x, y default values in the function param because it also depends on some variables
    if (x === void 0) { // if x undefined, then it depends on the wall width, game width
      if (GameDimension.getOrientation(windowWidth, windowHeight) === "landscape") x = GAME_LANDSCAPE_WIDTH + (wallWidth / 2)
      else x = GAME_PORTRAIT_WIDTH + (wallWidth / 2);
    }
    if (y === void 0) { // if y undefined, then it depends on the wall height, game height
      if (position === "down") {
        y = (gameHeight - (gameHeight * FLOOR_HEIGHT)) - (wallHeight / 2); // papatong lang sa nav bar pababa
      } else if (position === "up") {
        y = ((gameHeight * ROOF_HEIGHT)) + (wallHeight / 2);
      }
    }
    return createRectangle ({
      x: x,
      y: y,
      width: wallWidth,
      height: wallHeight,
      heightPercent: heightPercent,
      borderRadius: 0,
      color: "black",
      label: "Wall Rectangle",
      static: true,
    });
  }
  // ==================================== Entities ===================================

  // ================================= Matter Bodies =================================
  const createRectangle: Body = (prop) => {
    return {
      width: prop.width,
      height: prop.height,
      heightPercent: prop.heightPercent, // only useful for wall
      borderRadius: prop.borderRadius,
      color: prop.color,
      body: BODIES.rectangle(prop.x, prop.y, prop.width, prop.height, { isStatic: prop.static, label: prop.label })
    }
  }

  const createCircle: Body = (prop) => {
    // circle view size is effected by border radius
    // while circle body in matter js, it's size = radius
    const bodySize = prop.size / 2; // for Circle Matterjs Body
    return {
      size: prop.size, // for Circle View Component
      borderRadius: prop.borderRadius,
      color: prop.color,
      body: BODIES.circle(prop.x, prop.y, bodySize, { isStatic: prop.static, label: prop.label })
    }
  }
  // ================================= Matter Bodies =================================

  // =================================== Getters =====================================
  // won't work              { coords } - because we access x,y from player which is then possibly undef obj
  export const getPlayer = (coords = {}) => {
    const player = createPlayer(coords);
    WORLD.add(world, player.body);
    console.log("Creating Player - world.bodies.length: " + world.bodies.length);
    return player;
  }
  export const getRoof = () => {
    const roof = createRoof({});
    WORLD.add(world, roof.body);
    console.log("Creating Roof - world.bodies.length: " + world.bodies.length);
    return roof;
  }
  export const getFloor = () => {
    const floor = createFloor({});
    WORLD.add(world, floor.body);
    console.log("Creating Floor - world.bodies.length: " + world.bodies.length);
    return floor;
  }
  export const getWall = (prop = {}) => {
    const wall = createWall(prop);
    WORLD.add(world, wall.body);
    console.log("Creating Wall - world.bodies.length: " + world.bodies.length);
    return wall;
  }
  // =================================== Getters =====================================
}

