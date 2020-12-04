import { AppState } from 'react-native'
import FlappyBallGame from '../../..';

export namespace GameAppState {
  type Event = (event: string) => void;
  type GameState = (game: FlappyBallGame) => void;
  type StateHandler = (state: string, game:FlappyBallGame) => void;

  let callback: Event; // so that i can remove event handler
  
  const _handleAppStateChange: StateHandler = (nextAppState, game) => {
    ////////////////////////////////////////////////////////////
    console.log("\ngameState.tsx:\n++++++++++++++++++++++++");
    if (!game.paused && nextAppState === "background") {
      console.log("GAME STATE CHANGE has effect");
      console.log("\tBACKGROUND...");
      game.engine.stop();
     
    } else {
      console.log("GAME STATE CHANGE has no effect");
      console.log("GAME is either PAUSED or GAMEOVER");
    }
    console.log("++++++++++++++++++++++++\n");
    ////////////////////////////////////////////////////////////
  }
  
  export const addChangeListener: GameState = (game) => {
    console.log("\tgameState.tsx: addChangeListener")
    callback = (nextAppState) => _handleAppStateChange(nextAppState, game);
    AppState.addEventListener('change', callback);
  }

  export const removeChangeListener = () => {
    console.log(" removeStateChangeListener")
    AppState.removeEventListener('change', callback);
  }
}
