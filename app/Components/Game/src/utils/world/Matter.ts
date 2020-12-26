import { 
  BODIES, 
  BODY,
  PLAYER_SIZE, 
  FLOOR_HEIGHT, 
  ROOF_HEIGHT, 
  world, 
  WORLD, 
  GAME_LANDSCAPE_WIDTH,
  GAME_PORTRAIT_WIDTH,
  SCREEN_HEIGHT,
} from "./constants";
import { GameDimension } from "../helpers/dimensions";
import { getStatusBarHeight } from "react-native-status-bar-height";

export namespace Matter { // @remind refactor types
  type Coordinates = {x?: number, y?:number};

  // type Body = (matter: MatterProps) => MatterProps
  type Body<Params, Return> = <Additional>(required: Params, addtional: Additional) => Return & Additional;
  type BodyParams = {
    x: number,
    y: number,
    borderRadius: number,
    color: string,
    label: string,
    static: boolean,
  }

  // type StaticBody = (params: WallParams | any) => MatterProps; // object is required, but params are optional
  type StaticBody<Params, Return> = (params: Params) => Return; // object is required, but params are optional
  
  type DynamicBody<Params, Return> = (center: Params) => Return;  // center obj is required but x, y props is optional LOL

  // wall types
  type WallPos = keyof { up: string, down: string};
  type WallParams = Coordinates & { heightPercent: number, position?: WallPos, isStatic?: boolean };

  // rectangle types
  type RectangleReturn = {
    width: number,
    height: number,
    borderRadius: number,
    color: string,
    body: any,
  }

  // circle types
  type CircleReturn = {
    size: number, // for Circle View Component
    borderRadius: number,
    color: string,
    body: any
  }


  // ==================================== Entities ===================================
  const createPlayer: DynamicBody<Coordinates, CircleReturn> = ({ x, y }) => {
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
      label: "Player-Circle",
      static: false,
    }, {});
  }
  
  const createFloor: StaticBody<{}, RectangleReturn> = () => {
    const 
      // NOTE: matter js CENTER x, y works differently.
      // Observe centerX, which is half of screen width
      // but we didn't explicity minus the half of floor width to it to fit the floor
      { windowWidth, windowHeight, gameHeight } = GameDimension.window(),
      // [ floorWidth, floorHeight ] = [ windowWidth + (getStatusBarHeight() * 2), gameHeight * FLOOR_HEIGHT ],
      // gonna maximize the floor width, for falling wall to be caught in portrait
      [ floorWidth, floorHeight ] = [ SCREEN_HEIGHT + (getStatusBarHeight() * 2), gameHeight * FLOOR_HEIGHT ],
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
      label: "Floor-Rectangle",
      static: true,
    }, {});
  }
  
  const createRoof: StaticBody<{}, RectangleReturn> = () => {
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
      label: "Roof-Rectangle",
      static: true,
    }, {});
  }

  // possible cases of coordinates:
  //    x defined, y undefined -> showing walls initially (Initial Entity Wall), based on previous wall's x
  //    x and y are both defined -> showing walls with specific coords, triggered by orientation
  //    x and y are both undefined -> showing walls by default: coords are purely based on game dimensions
  const createWall: StaticBody<WallParams, RectangleReturn & { heightPercent: number }> = ({ x, y, heightPercent, position, isStatic=true }) => { // @note INSPECTED: good
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
        y: y ? y : 0,
        width: wallWidth,
        height: wallHeight,
        borderRadius: 0,
        color: "black",
        label: "Wall-Rectangle",
        static: isStatic,
      }, { 
        heightPercent: heightPercent,
     });
  }
  // ==================================== Entities ===================================

  // ================================= Matter Bodies =================================
  const createRectangle: Body<BodyParams & { width: number, height: number }, RectangleReturn> = (required, additional) => {
    return {
      width: required.width,
      height: required.height,
      // heightPercent: prop.heightPercent, // only useful for wall
      borderRadius: required.borderRadius,
      color: required.color,
      body: BODIES.rectangle(required.x, required.y, required.width, required.height, { isStatic: required.static, label: required.label }),
      ...additional,
    }
  }

  const createCircle: Body<BodyParams & { size: number }, CircleReturn> = (required, additional) => {
    // circle view size is effected by border radius
    // while circle body in matter js, it's size = radius
    const bodySize = required.size / 2; // for Circle Matterjs Body
    return {
      size: required.size, // for Circle View Component
      borderRadius: required.borderRadius,
      color: required.color,
      body: BODIES.circle(required.x, required.y, bodySize, { isStatic: required.static, label: required.label }),
      ...additional,
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
  export const getWall = (prop: any) => {
    const wall = createWall(prop);
    WORLD.add(world, wall.body);
    console.log("Creating Wall - world.bodies.length: " + world.bodies.length);
    return wall;
  }
  // =================================== Getters =====================================
}

