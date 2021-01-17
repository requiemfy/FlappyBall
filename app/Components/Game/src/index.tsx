import * as React from 'react'
import { Alert, AppState, Dimensions, Platform, Text } from 'react-native'
import { StatusBar, TouchableWithoutFeedback, View } from 'react-native';
// import { GameEngine, GameEngineProperties } from 'react-native-game-engine'; // @remind clear this soon
import { GameEngine } from './utils/helpers/react-native-game-engine';

import { GameAppState } from './utils/helpers/events/GameState';
import { Orientation } from './utils/helpers/events/Orientation';
import { 
  BODY, 
  COMPOSITE, 
  // engine, 
  EVENTS, 
  NAVBAR_HEIGHT, 
  ENGINE,
  // world 
} from './utils/world/constants';
import { Entities } from './utils/world/Entities';
import { Matter } from './utils/world/Matter';
import { Physics } from './utils/world/Physics';

import { getStatusBarHeight } from 'react-native-status-bar-height';
import { GameDimension } from './utils/helpers/dimensions';

import * as ScreenOrientation from 'expo-screen-orientation';

import * as Updates from 'expo-updates';
import { GameAlert } from './utils/helpers/alerts';
import TopBar from './components/TopBar';
import { NavigationParams } from 'react-navigation';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { Engine, World } from 'matter-js';
import Player from './components/Player';

interface Props { 
  navigation: NavigationParams; 
  route: { params: { button: keyof { play: string; resume: string; restart: string; } } } 
}
interface State {
  left: number; // used in orientation, i needed this because component doesn't automatically render in orientation change
  score: number;
}
interface Game {
  engine: GameEngine;
  entities: Entities.All;
  paused: boolean;
  over: boolean;
  wallIds: number[]; // [[wall id, wall x], ...]
  wallFreedIds: number[];
  entitiesInitialized: boolean;
  gravity: number;
  matterEngine: Engine;
  matterWorld: World;
  
  menu(): boolean; // toggle true/false and pass to paused
  onGameEngineEvent(e: { type: string; }): void;
}

export default class FlappyBallGame extends React.PureComponent<Props, State> implements Game{

  engine!: GameEngine;
  entities!: Entities.All; // all entities (player, floor)
  playerRef!: Player;
  paused = false; 
  over = false;
  wallIds: number[] = [];
  wallFreedIds: number[] = [];
  willUnmount = false;
  entitiesInitialized = false;
  gravity = 0.12;
  state = {score:0, left: 0,};
  matterEngine = ENGINE.create({ enableSleeping:false } );
  matterWorld = this.matterEngine.world;


  constructor(props: Props) {
    super(props);
    // const TEST_UPDATE = 0;
    // Updates.checkForUpdateAsync().then((update) => update.isAvailable ? GameAlert.hasUpdate() : null);
    Entities.getInitial(this); // entities is initialized here
  }

  componentDidMount() {
    ////////////////////////////////////////////////////////////
    console.log("\nindex.tsx:\n--------------------------");
    console.log("FLAPPY GAME DID MOUNT!!");
    Physics.addCollisionListener(this);
    Orientation.addChangeListener(this); 
    GameAppState.addChangeListener(this);
    console.log("--------------------------\n")
    ////////////////////////////////////////////////////////////
    setTimeout(() => {
      this.engine.stop();
    }, 0)
  }

  componentWillUnmount() {
    console.log("FLAPPY GAME WILL UNMOUNT!!")
    Orientation.removeChangeListener();
    GameAppState.removeChangeListener();
    Physics.removeCollisionListener(this);
    // this.entities.game = null; // @note to avoid cycle reference
  }

  setEngineRef = (ref: GameEngine) => {
    this.engine = ref;
  }

  menu = () => {
    ////////////////////////////////////////////////////////////
    console.log("\nindex.tsx:\n--------------------------");
    if (!this.over) {
      if (!this.paused) {
        console.log("=======>>>>>>>>>>>>>>>PAUSED<<<<<<<<<<<<<<<<=======");
        this.engine.stop(); // i stop() went missing, add it to GameEngine index.d.ts
      } 
      this.props.navigation.push("Menu", { button: "resume" })
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

  onGameEngineEvent = (e: { type: string; }) => {
    if (e.type === "stopped") {
      this.paused = true;
      if (this.over && !this.willUnmount) {
        this.willUnmount = true; // this is necessary because game engine is stopping again (even already stopped) when unmounting
        Physics.removeCollisionListener(this);
        console.log("MOUNTING MENU BECAUSE COLLISION DETECTED")
        this.props.navigation.push("Menu", { button: "restart", });
      }
    } else if (e.type === "started") {
      this.paused = false;
    }
    ////////////////////////////////////////////////////////////
    console.log("\nindex.tsx:\n--------------------------");
    console.log(e);
    console.log("this.paused " + this.paused);
    console.log("this.over " + this.over);
    console.log("--------------------------");
    ////////////////////////////////////////////////////////////
  }

  playerFly = () => {
    if (this.paused && !this.over) this.engine.start(); // if start() went missing, add it to GameEngine index.d.ts
    let { width, height } = Dimensions.get("window"),
        orient = GameDimension.getOrientation(width, height);
    if (orient === "landscape") Physics.playerRelativity.gravity(-0.0025);
    else Physics.playerRelativity.gravity(-0.003);

    this.playerRef.stopCurrentAnim(); // @remind i actually this should be in player physics depending on gravity sign ( + - )
    
    // just choose either animation
    // this.playerRef.setState({ startSprite: this.playerRef.fly });
    this.playerRef.setState({ startSprite: this.playerRef.reverseFallThenFly });
  }

  playerFall = () => {
    let { width, height } = Dimensions.get("window"),
        orient = GameDimension.getOrientation(width, height);
    if (orient === "landscape") Physics.playerRelativity.gravity(0.001);
    else Physics.playerRelativity.gravity(0.0015); 

    this.playerRef.stopCurrentAnim();

    // just choose either animation
    // this.playerRef.setState({ startSprite: this.playerRef.fall });
    this.playerRef.setState({ startSprite: this.playerRef.reverseFlyThenFall });
  }

  render() {
    ////////////////////////////////////////////////////////////
    console.log("\nindex.tsx:")
    console.log("--------------------------");
    console.log("RENDER()..." + this.props.route.params?.button);
    console.log("--------------------------\n");
    ////////////////////////////////////////////////////////////
    return (
      <View style={{ flex: 1, }}>
        <TopBar score={this.state.score} pause={this.menu} running="Menu"/>
        <TouchableWithoutFeedback
          onPressIn={this.playerFly}
          onPressOut={this.playerFall}>
           {/* this view is necessary, because GameEngine return many components
          and TouchableWithoutFeedback only works with 1 component */}
          <View style={{ 
            flex: 1, 
            flexDirection: "row",
            backgroundColor: "pink", }}> 
            <GameEngine
              ref={this.setEngineRef}
              onEvent={this.onGameEngineEvent}
              systems={[Physics.system]}
              entities={this.entities} 
              // running={!this.paused} // @note running
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
