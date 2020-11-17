import { 
  BODIES, 
  PLAYER_SIZE, 
  FLOOR_HEIGHT, 
  ROOF_HEIGHT, 
  world, 
  WORLD, 
  NAVBAR_HEIGHT
} from "./constants";
import window from "../helpers/dimensions";

export namespace Matter {
  type Coordinates = {x?: number, y?:number};
  type MatterProps = { [key: string]: any };
  type Body = (matter: MatterProps) => MatterProps
  type WallParams = Coordinates & { position?: string };
  type StaticBody = (params: WallParams) => MatterProps; // object is required, but params are optional
  type DynamicBody = (center: Coordinates) => MatterProps;  // center obj is required but x, y props is optional LOL
  type FollowingParams = { wall: WallParams }; // this should not be optional/undefined
  type FollowingBodies = (bodies?: FollowingParams) => MatterProps;
  type InitialParams = { player: Coordinates }; // player obj is required but props are optional
  type InitialBodies = (bodies?: InitialParams) => MatterProps;

  // ================================ Matter entities ================================
  const createPlayer: DynamicBody = ({ x = 20, y = 100 }) => {
    const 
      { width, height, gameHeight } = window(),
      playerBaseSize = gameHeight * PLAYER_SIZE;
    return createCircle ({
      x: x,
      y: y,
      size: playerBaseSize,
      borderRadius: playerBaseSize / 2,
      color: "red",
      static: false,
    });
  }
  
  const createFloor: StaticBody = () => {
    const 
      // NOTE: matter js CENTER x, y works differently.
      // Observe centerX, which is half of screen width
      // but we didn't explicity minus the half of floor width to it
      { width, height, gameHeight } = window(),
      [ floorWidth, floorHeight ] = [ width, gameHeight * FLOOR_HEIGHT ],
      [ centerX, centerY ] = [ width / 2, gameHeight - (floorHeight / 2) ]
    ////////////////////////////////////////////////////////////
    console.log("\nmatter.tsx: ");
    console.log("=========== ============== ===========");
    console.log("CREATING FLOOR");
    console.log("\tDimensions width: " + width)
    console.log("\tDimensions height: " + height)
    ////////////////////////////////////////////////////////////
    return createRectangle ({
      x: centerX,
      y: centerY,
      width: floorWidth,
      height: floorHeight,
      borderRadius: 0,
      color: "green",
      static: true,
    });
  }
  
  const createRoof: StaticBody = () => {
    const 
      { width, height, gameHeight } = window(),
      roofWidth = width, 
      roofHeight = gameHeight * ROOF_HEIGHT,
      centerX = width / 2, 
      centerY = roofHeight / 2; // papatong lang sa nav bar pababa
    return createRectangle ({
      x: centerX,
      y: centerY,
      width: roofWidth,
      height: roofHeight,
      borderRadius: 0,
      color: "brown",
      static: true,
    });
  }
  
  const createWall: StaticBody = ({ x, y, position = "down" }) => {
    const 
      { width, height, gameHeight } = window(),
      wallWidth = width * 0.07, 
      wallHeight = gameHeight * 0.4;
    if (!x && !y) { // both undefined
      x = width + (wallWidth / 2);
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
      borderRadius: 0,
      color: "black",
      static: true,
    });
  }
  // ================================ Matter Entities ================================

  // ======================= Matter General Functions/Getters =======================
  const createRectangle: Body = (prop) => {
    return {
      width: prop.width,
      height: prop.height,
      borderRadius: prop.borderRadius,
      color: prop.color,
      body: BODIES.rectangle(prop.x, prop.y, prop.width, prop.height, { isStatic: prop.static })
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
      body: BODIES.circle(prop.x, prop.y, bodySize, { isStatic: prop.static })
    }
  }

  // export const getInitial: InitialBodies = (bodies) => { // required params
  // bodies = { player: {} } is necessary for being optional => {} | undefined
  // we can extract property from undefined obj
  // but we can extract undefined props from obj
  export const getInitial: InitialBodies = (bodies = { player: {} }) => {
    const 
      player = bodies.player,
      matter = {
        player: createPlayer(player),
        floor: createFloor({}), // object is required, but params are optional
        roof: createRoof({}),
      }
    WORLD.add(world, [matter.player.body, matter.floor.body, matter.roof.body]);
    ////////////////////////////////////////////////////////////
    console.log("----------- GETTING MATTER -----------");
    console.log("world.bodies.length: " + world.bodies.length);
    console.log("=========== ============== ===========");
    ////////////////////////////////////////////////////////////
    return matter;
  }

  // used in entities
  export const getFollowing: FollowingBodies = (bodies = { wall: {} }) => {
    const matter = {
      wall: createWall(bodies.wall),
    };
    WORLD.add(world, matter.wall.body);
    return matter;
  }
  // ======================= Matter General Functions/Getters =======================

}

