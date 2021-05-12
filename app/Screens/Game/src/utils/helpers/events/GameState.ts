import { AppState } from 'react-native'
import FlappyBallGame from '../../..';

export namespace GameAppState {
  type Event = (event: string) => void;
  type GameState = (game: FlappyBallGame) => void;
  type StateHandler = (state: string, game:FlappyBallGame) => void;

  
  const _handleAppStateChange: StateHandler = (nextAppState, game) => {
    if (!game.paused && nextAppState === "background") {
      game.engine.stop();
    }
  }
  
  let stateChangeCallback: Event | any; // so that i can remove event handler
  export const addChangeListener: GameState = (game) => {
    stateChangeCallback = (nextAppState: string) => _handleAppStateChange(nextAppState, game);
    AppState.addEventListener('change', stateChangeCallback);
  }

  export const removeChangeListener = () => {
    AppState.removeEventListener('change', stateChangeCallback);
    stateChangeCallback = null;
  }
}
