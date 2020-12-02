import FlappyBallGame from "../.."
import { Entities } from "../world/Entities";

export namespace Coordinates {

  // this is means is the last ADDED wall, i don't pertain on the wall position
  export const getLatestWallX = (entities: any) => {
    const wallCount = entities.wall.length,
          wallIndex = entities.wall[wallCount-1];
    return entities[wallIndex].body.position.x;
  }

}