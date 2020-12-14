import FlappyBallGame from "../.."
import { Entities } from "../world/Entities";

export namespace Coordinates {

  export const getEndWallX = (entities: Entities.All) => {
    const wallCount = entities.game.wall.length,
          wallIndex = entities.game.wall[wallCount-1];
    return entities[wallIndex].body.position.x;
  }

  export const getFirstWallX = (entities: Entities.All) => {
    const wallIndex = entities.game.wall[0];
    return entities[wallIndex].body.position.x;
  }

}