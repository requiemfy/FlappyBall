import { 
  BODIES, 
  PLAYER_SIZE, 
  FLOOR_HEIGHT, 
  ROOF_HEIGHT, 
  WORLD, 
  GAME_LANDSCAPE_WIDTH,
  GAME_PORTRAIT_WIDTH,
} from "./constants";
import { GameDimension } from "../helpers/dimensions";
import { getStatusBarHeight } from "react-native-status-bar-height";
import FlappyBallGame from "../..";

export namespace Matter {
  type OptionalCoordinates = {x?: number, y?:number};
  type TwoDimensions = { width: number; height: number; }
  type Shape<Config> = <Params>(
    required: Config & {
      x: number;
      y: number;
      borderRadius: number;
      color: string;
      label: string;
      static: boolean;
    }, 
    addtional: Params
  ) => Config & Params & {
    borderRadius: number;
    color: string;
    body: any;
  };
  type Body<Params, Return> = (params: Params) => Return & {
    borderRadius: number;
    color: string;
    body: any;
  };
  type WallParams = OptionalCoordinates & { 
    heightPercent: number;
    position?: keyof { up: string, down: string};
    isStatic?: boolean;
  };

  const createPlayer: Body<OptionalCoordinates, { size: number }> = ({ x, y }) => {
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
      color: "transparent",
      label: "Player-Circle",
      static: true,
    }, {});
  }
  
  const createFloor: Body<{}, TwoDimensions> = () => {
    const 
      { windowWidth, windowHeight, gameHeight } = GameDimension.window(),
      [ floorWidth, floorHeight ] = [ GameDimension.getWidth("now"), gameHeight * FLOOR_HEIGHT ],
      [ centerX, centerY ] = [ windowWidth / 2, gameHeight - (floorHeight / 2) ]
    return createRectangle ({
      x: centerX,
      y: centerY,
      width: floorWidth,
      height: floorHeight,
      borderRadius: 0,
      color: "black",
      label: "Floor-Rectangle",
      static: true,
    }, {});
  }
  
  const createRoof: Body<{}, TwoDimensions> = () => {
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
      color: "black",
      label: "Roof-Rectangle",
      static: true,
    }, {});
  }

  const createWall: Body<WallParams, TwoDimensions & { heightPercent: number }> = ({ x, y, heightPercent, position, isStatic=true }) => { // @note INSPECTED: good
    const 
      { windowWidth, windowHeight, gameHeight } = GameDimension.window(),
      [ wallWidth, wallHeight ] = [ gameHeight * 0.07, gameHeight * heightPercent ]; 
    if (x === void 0) {
      if (GameDimension.getOrientation(windowWidth, windowHeight) === "landscape") x = GAME_LANDSCAPE_WIDTH + (wallWidth / 2)
      else x = GAME_PORTRAIT_WIDTH + (wallWidth / 2);
    }
    if (y === void 0) {
      if (position === "down") {
        y = (gameHeight - (gameHeight * FLOOR_HEIGHT)) - (wallHeight / 2);
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

  const createRectangle: Shape<TwoDimensions> = (required, additional) => {
    return {
      width: required.width,
      height: required.height,
      borderRadius: required.borderRadius,
      color: required.color,
      body: BODIES.rectangle(required.x, required.y, required.width, required.height, { isStatic: required.static, label: required.label }),
      ...additional,
    }
  }

  const createCircle: Shape<{ size: number }> = (required, additional) => {
    const bodySize = required.size / 2; 
    return {
      size: required.size,
      borderRadius: required.borderRadius,
      color: required.color,
      body: BODIES.circle(required.x, required.y, bodySize, { isStatic: required.static, label: required.label }),
      ...additional,
    }
  }

  export const getPlayer = (game: FlappyBallGame, coords = {}) => {
    const player = createPlayer(coords);
    WORLD.add(game.matterWorld, player.body);
    return player;
  }
  export const getRoof = (game: FlappyBallGame) => {
    const roof = createRoof({});
    WORLD.add(game.matterWorld, roof.body);
    return roof;
  }
  export const getFloor = (game: FlappyBallGame) => {
    const floor = createFloor({});
    WORLD.add(game.matterWorld, floor.body);
    return floor;
  }
  export const getWall = (game: FlappyBallGame, prop: any) => {
    const wall = createWall(prop);
    WORLD.add(game.matterWorld, wall.body);
    return wall;
  }
}

