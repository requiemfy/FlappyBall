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
  type Coordinates = {x: number, y:number};
  type MatterProps = { [key: string]: any };

  type DynamicBody = (center?: Coordinates) => MatterProps;
  // type DynamicBody = (x: number | null, y: number | null) => MatterProps;

  type StaticBody = (center?: Coordinates, position?: string) => MatterProps;
  type Bodies = (
    bodies: InitialParams
  ) => MatterProps;
  type Body = (matter: MatterProps) => MatterProps
  

  // ================================ Matter entities ================================
  const createPlayer: DynamicBody = (center) => {
    let x, y;
    if (center === undefined) {
      x = 20;
      y = 100;
    } else {
      x = center.x;
      y = center.y;
    }



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
  
  // const createWall: StaticBody = (centerX, centerY, pos = "down") => {
  const createWall: StaticBody = (center, pos = "down") => {
    let centerX, centerY;
    const 
      { width, height, gameHeight } = window(),
      wallWidth = width * 0.07, 
      wallHeight = gameHeight * 0.4;

      // if (centerX === undefined) {
      //   centerX = width / 2;
      //   if (pos === "down") {
      //     centerY = (gameHeight - (gameHeight * FLOOR_HEIGHT)) - (wallHeight / 2); // papatong lang sa nav bar pababa
      //   } else if (pos === "up") {
      //     centerY = ((gameHeight * ROOF_HEIGHT)) + (wallHeight / 2);
      //   }
      // }

      if (center === undefined) {
        centerX = width / 2;
        if (pos === "down") {
          centerY = (gameHeight - (gameHeight * FLOOR_HEIGHT)) - (wallHeight / 2); // papatong lang sa nav bar pababa
        } else if (pos === "up") {
          centerY = ((gameHeight * ROOF_HEIGHT)) + (wallHeight / 2);
        }
      } else {
        centerX = center.x;
        centerY = center.y;
      }

    return createBody ({
      x: centerX,
      y: centerY,
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
  type InitialParams = { player: { center: Coordinates } | any }
  export const getInitial: Bodies = (bodies: InitialParams) => { // required params
    const player = bodies.player;
    const matter = {
      player: createPlayer(player.center),
      floor: createFloor(),
      roof: createRoof(),
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
  type FollowingParams = { wall: { center: Coordinates, position: string } | any };
  export const getFollowing = (bodies: FollowingParams) => {
    const wall = bodies.wall;
    const matter = {
      // wall: createWall(bodies.wall[0], bodies.wall[1], bodies.wall[2]), // you go expect 3 values
      wall: createWall(wall.center, wall.position),
    };
    
    WORLD.add(world, matter.wall.body);
    return matter;
  }
  // ======================= Matter General Functions/Getters =======================

}

