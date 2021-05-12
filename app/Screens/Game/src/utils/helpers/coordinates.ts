import { Entities } from "../world/Entities";

export namespace Coordinates {

  export const getEndWallX = (entities: Entities.All) => {
    const wallCount = entities.game.wallIds.length,
          wallIndex = entities.game.wallIds[wallCount-1];
    return entities[wallIndex].body.position.x;
  }

  export const getFirstWallX = (entities: Entities.All) => {
    const wallIndex = entities.game.wallIds[0];
    return entities[wallIndex].body.position.x;
  }

}