import * as React from 'react'
import { AppState, Dimensions } from 'react-native'
import { StatusBar, TouchableWithoutFeedback, View } from 'react-native';
import { GameEngine, GameEngineProperties } from 'react-native-game-engine';
import { GameAppState } from './utils/helpers/events/GameState';
import { Orientation } from './utils/helpers/events/Orientation';
import { COMPOSITE, NAVBAR_HEIGHT, world } from './utils/world/constants';
import { Entities } from './utils/world/Entities';
import { Matter } from './utils/world/Matter';
import { Physics } from './utils/world/Physics';

import { getStatusBarHeight } from 'react-native-status-bar-height';
import { GameDimension } from './utils/helpers/dimensions';

import * as ScreenOrientation from 'expo-screen-orientation';
import { DeviceMotion } from 'expo-sensors';


interface EventType { type: string; }
interface Game {
  engine: GameEngine;
  entities: Entities.Initial & Entities.Following;
  paused: boolean;
  over: boolean;
  entitiesInitialized: boolean;
  
  pauseOrResume(): boolean; // toggle true/false and pass to paused
  onEvent(e: EventType): void;
}

export default class FlappyBallGame extends React.PureComponent implements Game{

  engine: any;
  entities: any; // all entities (player, floor)
  paused: boolean; // used in pause button
  over: boolean; // used in pause button
  entitiesInitialized: boolean;
  state: { left: number };

  constructor(props: object) {
    super(props);
    this.paused = true; 
    this.over = false;
    this.entitiesInitialized = false;
    this.state = { left: 0 };
    
    Entities.getInitial(this);
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
    Physics.collision(this); // game over
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
    } else if (e.type === "started") {
      this.paused = false;
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
    if (orient === "landscape") this.entities.gravity = -0.2;
    else this.entities.gravity = -0.3; 
  }

  playerFall() {
    let { width, height } = Dimensions.get("window"),
        orient = GameDimension.getOrientation(width, height);
    if (orient === "landscape") this.entities.gravity = 0.2;
    else this.entities.gravity = 0.3; 
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
        
        <TouchableWithoutFeedback onPress={ this.pauseOrResume }>
          <View style={{
            backgroundColor:"yellow",
            width: "100%",
            height: NAVBAR_HEIGHT,
            }}></View>
        </TouchableWithoutFeedback>

        {/* ------------------------------------------------------------ */}
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
              style={{ 
                flex: 1, 
                backgroundColor: "blue", 
                left: this.state.left,
              }}
              systems={ [Physics.system] }
              entities={ this.entities } 
              running={ !this.paused } />
            <StatusBar hidden />

          </View>
        </TouchableWithoutFeedback>
        {/* ------------------------------------------------------------ */}

      </View>
    );
  }
}
