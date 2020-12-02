import FlappyBallGame from "../.."
import { Entities } from "../world/Entities";

export namespace Coordinates {

  // this is means is the last ADDED wall, i don't pertain on the wall position
  export const getLatestWallX = (entities: any) => {
    const wallCount = entities.wall.length,
          wallIndex = entities.wall[wallCount-1];
    return entities[wallIndex].body.position.x;
  }

  // export const getFirstWallX = (entities: any) => { // @remind not in used, clear
  //   const wallIndex = entities.wall[0];
  //   return entities[wallIndex].body.position.x;
  // }

}