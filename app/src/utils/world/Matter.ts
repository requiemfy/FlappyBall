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
import FlappyBallGame from "../..";
import Box from "../../components/Box";

export namespace Matter {

  type Coordinates = {x?: number, y?:number};
  type MatterProps = { [key: string]: any };

  // center obj is required but x, y props is optional LOL
  type DynamicBody = (center: Coordinates) => MatterProps;

  // type DynamicBody = (x: number | null, y: number | null) => MatterProps;

  type Body = (matter: MatterProps) => MatterProps
  

  // ================================ Matter entities ================================
  // const createPlayer: DynamicBody = (center) => {
  //   let x, y;
  //   if (center === undefined) {
  //     x = 20;
  //     y = 100;
  //   } else {
  //     x = center.x;
  //     y = center.y;
  //   }
  const createPlayer: DynamicBody = ({ x = 20, y = 100 }) => {
    const 
      { width, height, gameHeight } = window(),
      playerBaseSize = gameHeight * PLAYER_SIZE;
    return createBody ({
      x: x,
      y: y,
      width: playerBaseSize,
      height: playerBaseSize,
      borderRadius: playerBaseSize / 2,
      color: "red",
      static: true,
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
    return createBody ({
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
    return createBody ({
      x: centerX,
      y: centerY,
      width: roofWidth,
      height: roofHeight,
      borderRadius: 0,
      color: "brown",
      static: true,
    });
  }
  


  type WallParams = Coordinates & { position?: string };

  type StaticBody = (params: WallParams) => MatterProps;


  // const createWall: StaticBody = (centerX, centerY, pos = "down") => {
  // const createWall: StaticBody = (center, position = "down") => {
  const createWall: StaticBody = ({ x, y, position }) => {

    // let centerX, centerY;
    const 
      { width, height, gameHeight } = window(),
      wallWidth = width * 0.07, 
      wallHeight = gameHeight * 0.4;

      // if (center === undefined) {
      //   centerX = width / 2;
      //   if (position === "down") {
      //     centerY = (gameHeight - (gameHeight * FLOOR_HEIGHT)) - (wallHeight / 2); // papatong lang sa nav bar pababa
      //   } else if (position === "up") {
      //     centerY = ((gameHeight * ROOF_HEIGHT)) + (wallHeight / 2);
      //   }
      // } else {
      //   centerX = center.x;
      //   centerY = center.y;
      // }

      if (!x && !y) { // both undefined
        x = width / 2;
        if (position === "down") {
          y = (gameHeight - (gameHeight * FLOOR_HEIGHT)) - (wallHeight / 2); // papatong lang sa nav bar pababa
        } else if (position === "up") {
          y = ((gameHeight * ROOF_HEIGHT)) + (wallHeight / 2);
        }
      }

    return createBody ({
      x: x,
      y: y,
      // x: centerX,
      // y: centerY,
      width: wallWidth,
      height: wallHeight,
      borderRadius: 0,
      color: "black",
      static: true,
    });
  }
  // ================================ Matter Entities ================================

  // ======================= Matter General Functions/Getters =======================
  const createBody: Body = (prop) => {
    return {
      width: prop.width,
      height: prop.height,
      borderRadius: prop.borderRadius,
      color: prop.color,
      body: BODIES.rectangle(prop.x, prop.y, prop.width, prop.height, { isStatic: prop.static })
    }
  }
  


















  // except wall
  type InitialParams = { player: Coordinates }; // player obj is required but props are optional
  type InitialBodies = (bodies?: InitialParams) => MatterProps;
 
  // export const getInitial: InitialBodies = (bodies) => { // required params
  // bodies = { player: {} } is necessary for being optional => {} | undefined
  // we can extract property from undefined obj
  // but we can extract undefined props from obj
  export const getInitial: InitialBodies = (bodies = { player: {} }) => {
    const player = bodies.player;
    const matter = {
      // player: createPlayer(player.center),
      player: createPlayer(player),

      floor: createFloor({}), //
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
  // export const getFollowing = (bodies = { wall: [undefined, undefined, "up"] }) => {

  // type FollowingParams = { wall: { center: Coordinates, position: string } | any };


  type FollowingParams = { wall: WallParams }; // this should not be optional/undefined
  type FollowingBodies = (bodies?: FollowingParams) => MatterProps;

  export const getFollowing: FollowingBodies = (bodies = { wall: {} }) => {
    const matter = {
      // wall: createWall(bodies.wall[0], bodies.wall[1], bodies.wall[2]), // you go expect 3 values
      // wall: createWall(wall.center, wall.position),
      wall: createWall(bodies.wall),
    };
    
    WORLD.add(world, matter.wall.body);
    return matter;
  }
  // ======================= Matter General Functions/Getters =======================

}

