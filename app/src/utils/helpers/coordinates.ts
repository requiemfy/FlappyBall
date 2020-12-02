import FlappyBallGame from "../.."
import { Entities } from "../world/Entities";

export namespace Coordinates {

  export const getLastWallX = (entities: any) => {
    const wallCount = entities.wall.length,
          wallIndex = entities.wall[wallCount-1];
    return entities[wallIndex].body.position.x;
  }

  export const getFirstWallX = (entities: any) => {
    const wallIndex = entities.wall[0];
    return entities[wallIndex].body.position.x;
  }

}