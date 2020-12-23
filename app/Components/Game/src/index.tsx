import * as React from 'react'
import { Alert, AppState, Dimensions, Text } from 'react-native'
import { StatusBar, TouchableWithoutFeedback, View } from 'react-native';
import { GameEngine, GameEngineProperties } from 'react-native-game-engine';
import { GameAppState } from './utils/helpers/events/GameState';
import { Orientation } from './utils/helpers/events/Orientation';
import { BODY, COMPOSITE, NAVBAR_HEIGHT, world } from './utils/world/constants';
import { Entities } from './utils/world/Entities';
import { Matter } from './utils/world/Matter';
import { Physics } from './utils/world/Physics';

import { getStatusBarHeight } from 'react-native-status-bar-height';
import { GameDimension } from './utils/helpers/dimensions';

import * as ScreenOrientation from 'expo-screen-orientation';

import * as Updates from 'expo-updates';
import { GameAlert } from './utils/helpers/alerts';
import TopBar from './components/TopBar';

interface Props {}
interface State {
  left: number; // used in orientation, i needed this because component doesn't automatically render in orientation change
  score: number;
  running: string; 
}
interface EventType { type: string; }
interface Game {
  engine: GameEngine;
  entities: Entities.All;
  paused: boolean;
  over: boolean;
  wallIds: number[]; // [[wall id, wall x], ...]
  wallFreedIds: number[];
  entitiesInitialized: boolean;
  gravity: number;
  
  pauseOrResume(): boolean; // toggle true/false and pass to paused
  onEvent(e: EventType): void;
}

export default class FlappyBallGame extends React.PureComponent<Props, State> implements Game {

  engine: any;
  entities!: Entities.All; // all entities (player, floor)
  paused: boolean; // used in pause button
  over: boolean; // used in pause button
  wallIds: number[];
  wallFreedIds: number[];
  entitiesInitialized: boolean;
  gravity: number;

  constructor(props: object) {
    super(props);

    // const TEST_UPDATE = 0;
    // Updates.checkForUpdateAsync().then((update) => update.isAvailable ? GameAlert.hasUpdate() : null);

    this.paused = true; 
    this.over = false;
    this.wallIds = [];
    this.wallFreedIds = [];
    this.entitiesInitialized = false;
    this.gravity = 0.1;
    this.state = { score:0, left: 0, running: "resume", };
    
    Entities.getInitial(this); // entities is initialized here
    this.pauseOrResume = this.pauseOrResume.bind(this);
    this.onEvent = this.onEvent.bind(this);
    this.playerFly = this.playerFly.bind(this);
    this.playerFall = this.playerFall.bind(this);

  }

  // all side effects here
  componentDidMount() {
    this.engine.stop();
    ////////////////////////////////////////////////////////////
    console.log("\nindex.tsx:\n--------------------------");
    console.log("componentDidMount!!");
    // Physics.collision(this); // game over
    Orientation.addChangeListener(this); 
    GameAppState.addChangeListener(this); // run|stop game engine
    console.log("--------------------------\n")
    ////////////////////////////////////////////////////////////
  }

  componentWillUnmount() {
    console.log("componentWillUnmount!!")
    Orientation.removeChangeListener();
    GameAppState.removeChangeListener();
  }

  // used in pause button,
  pauseOrResume() { 
    if (!this.entities) throw "index.tsx: this.entities is undefined";
    ////////////////////////////////////////////////////////////
    console.log("\nindex.tsx:\n--------------------------");
    if (!this.over) {
      if (!this.paused) {
        console.log("=======>>>>>>>>>>>>>>>PAUSED<<<<<<<<<<<<<<<<=======");
        this.engine.stop();
      } else {
        console.log("=======>>>>>>>>>>>>>>>RESUME<<<<<<<<<<<<<<<<=======")
        this.engine.start();
      }
    } else {
      console.log("GAME OVER")
    }
    const 
      lastPlayerX = this.entities.player.body.position.x,
      lastPlayerY = this.entities.player.body.position.y;
    console.log("this.over: " + this.over);
    console.log("this.paused: " + this.paused);
    console.log("lastPlayer x,y: " + lastPlayerX + ", " + lastPlayerY );
    console.log("--------------------------");
    ////////////////////////////////////////////////////////////
    return false;
  }

  onEvent(e: EventType) {
    if (e.type === "stopped") {
      this.paused = true;
      this.setState({ running: "resume" });
    } else if (e.type === "started") {
      this.paused = false;
      this.setState({ running: "pause" });
    }
    ////////////////////////////////////////////////////////////
    console.log("\nindex.tsx:\n--------------------------");
    console.log(e);
    console.log("this.paused " + this.paused);
    console.log("--------------------------");
    ////////////////////////////////////////////////////////////
  }

  playerFly() {
    if (this.paused) this.pauseOrResume();
    let { width, height } = Dimensions.get("window"),
        orient = GameDimension.getOrientation(width, height);
    if (orient === "landscape") Physics.playerRelativity.gravity(-0.003);
    else Physics.playerRelativity.gravity(-0.004);
    
    
  }

  playerFall() {
    let { width, height } = Dimensions.get("window"),
        orient = GameDimension.getOrientation(width, height);
    if (orient === "landscape") Physics.playerRelativity.gravity(0.001);
    else Physics.playerRelativity.gravity(0.0025); 
    
  }

  render() {
    ////////////////////////////////////////////////////////////
    console.log("\nindex.tsx:")
    console.log("--------------------------");
    console.log("RENDER()...");
    console.log("--------------------------\n");
    ////////////////////////////////////////////////////////////
    return (
      <View style={{ flex: 1, }}>
        <TopBar score={this.state.score} pauseOrResume={this.pauseOrResume} running={this.state.running} />
        <TouchableWithoutFeedback
          onPressIn={ this.playerFly }
          onPressOut={ this.playerFall }>
           {/* this view is necessary, because GameEngine return many components
          and TouchableWithoutFeedback only works with 1 component */}
          <View style={{ 
            flex: 1, 
            flexDirection: "row",
            backgroundColor: "pink", }}> 
            <GameEngine
              ref={ (ref) => { this.engine = ref; } }
              onEvent={ this.onEvent }
              systems={ [Physics.system] }
              entities={ this.entities } 
              running={ !this.paused } 
              style={{ 
                flex: 1, 
                backgroundColor: "blue", 
                left: this.state.left,
              }}/>
            <StatusBar hidden />
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}
