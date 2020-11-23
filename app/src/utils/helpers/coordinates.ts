import FlappyBallGame from "../.."

export namespace Coordinates {

  export const getLastWallX = (entities: any) => {
    const wallCount = entities.wall.length,
          wallIndex = entities.wall[wallCount-1];
    return entities[wallIndex].body.position.x;
  }

}