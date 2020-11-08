import { 
  BODIES, 
  PLAYER_SIZE, 
  FLOOR_HEIGHT, 
  ROOF_HEIGHT, 
  world, 
  WORLD 
} from "./constants";
import window from "../helpers/dimensions";

export namespace Matter {

  type MatterProps = { [key: string]: any };
  type DynamicBody = (x: number, y: number) => MatterProps;
  type StaticBody = () => MatterProps;
  type Bodies = (...args: number[][]) => MatterProps;
  type Body = (matter: MatterProps) => MatterProps
  
  const createPlayer: DynamicBody = (x, y) => {
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
  
  const createWall: StaticBody = () => {
    const 
      { width, height, gameHeight } = window(),
      wallWidth = width * 0.07, 
      wallHeight = gameHeight * 0.4,
      centerX = width / 2, 
      centerY = (gameHeight - (gameHeight * FLOOR_HEIGHT)) - (wallHeight / 2); // papatong lang sa nav bar pababa
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
  export const get: Bodies = ([px, py]) => {
    const matter = {
      player: createPlayer(px, py),
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
  
  // export function getWall(game: FlappyBallGame, nth: number) {
  //   const wally = createWall();
  //   game.entities["wall"+nth] = { 
  //     body: wally.body, 
  //     size: [wally.width, wally.height], 
  //     borderRadius: wally.borderRadius,
  //     color: wally.color, 
  //     renderer: Box,
  //   };
  //   WORLD.add(world, wally.body);
  // }

}
