import * as React from 'react'
import { BackHandler, Dimensions, ImageBackground, NativeEventSubscription } from 'react-native'
import { StatusBar, TouchableWithoutFeedback, View } from 'react-native';
import { GameEngine } from './utils/helpers/react-native-game-engine';
import { GameAppState } from './utils/helpers/events/GameState';
import { Orientation } from './utils/helpers/events/Orientation';
import { ENGINE } from './utils/world/constants';
import { Entities } from './utils/world/Entities';
import { Physics } from './utils/world/Physics';
import { GameDimension } from './utils/helpers/dimensions';
import TopBar from './components/TopBar';
import { NavigationParams } from 'react-navigation';
import { Engine, World } from 'matter-js';
import Player from './components/Player';
import Grass from './components/Grass';
import Roof from './components/Roof';
import { PulseIndicator } from 'react-native-indicators';
import { safeSetState } from '../../../src/helpers';

interface Props {
  navigation: NavigationParams;
  route: { 
    params: { 
      connection: keyof { online: string, offline: string };
    }
  }
}
interface State {
  left: number;
  score: number;
  loadingBG: boolean;
}
interface Game {
  engine: GameEngine;
  entities: Entities.All;
  paused: boolean;
  over: boolean;
  wallIds: number[]; 
  wallFreedIds: number[];
  entitiesInitialized: boolean;
  gravity: number;
  matterEngine: Engine;
  matterWorld: World;

  menu(): boolean; // toggle true/false and pass to paused
  onGameEngineEvent(e: { type: string; }): void;
}

export default class FlappyBallGame extends React.PureComponent<Props, State> implements Game {

  engine!: GameEngine;
  entities!: Entities.All; 
  playerRef!: Player;
  grassRef!: Grass;
  roofRef!: Roof;
  paused = false;
  over = false;
  wallIds: number[] = [];
  wallFreedIds: number[] = [];
  willUnmount = false;
  entitiesInitialized = false;
  gravity = 0.12;
  state = { score: 0, left: 0, loadingBG: true };
  matterEngine = ENGINE.create({ enableSleeping: false });
  matterWorld = this.matterEngine.world;
  connection = this.props.route.params.connection;
  backHandler!: NativeEventSubscription;
  mounted = true;
  safeSetState = safeSetState(this);

  constructor(props: Props) {
    super(props);
    // Updates.checkForUpdateAsync().then((update) => update.isAvailable ? GameAlert.hasUpdate() : null);
    Entities.getInitial(this);
  }

  componentDidMount() {
    Physics.addCollisionListener(this);
    Orientation.addChangeListener(this);
    GameAppState.addChangeListener(this);
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.backAction);
    setTimeout(() => {
      this.engine.stop();
    }, 0)
    Orientation.enableRotate(this);
    console.log("== game: Did mount, enable rotate");
  }

  componentWillUnmount() {
    this.mounted = false;
    this.safeSetState = () => null
    Physics.removeCollisionListener(this);
    Orientation.removeChangeListener();
    GameAppState.removeChangeListener();
    this.backHandler.remove();

    this.grassRef = null;
    this.playerRef = null;
    this.roofRef = null;
    this.matterEngine = null;
    this.matterWorld = null;
    this.entities.game = null;
  }

  setEngineRef = (ref: GameEngine) => {
    this.engine = ref;
  }

  menu = () => {
    if (!this.over) {
      if (!this.paused) {
        this.engine.stop();
      }
      this.grassRef.stop();
      this.roofRef.stop();
      this.props.navigation.push("Menu", { 
        button: "resume", 
        connection: this.connection,
      })
    }
    return false;
  }

  backAction = () => {
    return true;
  }

  onGameEngineEvent = (e: { type: string; }) => {
    if (e.type === "stopped") {
      this.paused = true;
      if (this.over && !this.willUnmount) {
        this.willUnmount = true; 
        Physics.removeCollisionListener(this);
        this.props.navigation.push("Menu", { 
          button: "restart", 
          score: this.state.score,
          connection: this.connection,
        });
      }
    } else if (e.type === "started") {
      this.paused = false;
    }
  }

  play = () => {
    this.engine.start();
    this.grassRef.move();
    this.roofRef.move();
  }

  playerFly = () => {
    if (!this.over) {
      if (this.paused) this.play();
      let { width, height } = Dimensions.get("window"),
        orient = GameDimension.getOrientation(width, height);
      if (orient === "landscape") Physics.playerRelativity.gravity(-0.0045);
      else Physics.playerRelativity.gravity(-0.005);
      this.playerRef.stopCurrentAnim();
      this.playerRef.safeSetState({ startSprite: this.playerRef.reverseFallThenFly });
    }
  }

  playerFall = () => {
    if (!this.over) {
      let { width, height } = Dimensions.get("window"),
        orient = GameDimension.getOrientation(width, height);
      if (orient === "landscape") Physics.playerRelativity.gravity(0.002);
      else Physics.playerRelativity.gravity(0.0015);
      this.playerRef.stopCurrentAnim();
      this.playerRef.safeSetState({ startSprite: this.playerRef.reverseFlyThenFall });
    }
  }

  render() {
    return (
      <View style={{ flex: 1, }}>
        <TopBar score={this.state.score} pause={this.menu} running="Menu" />
        <TouchableWithoutFeedback
          onPressIn={this.playerFly}
          onPressOut={this.playerFall}>
          <View style={{
            flex: 1,
            flexDirection: "row",
            backgroundColor: "black",
          }}>
            <ImageBackground source={require('../assets/bg.jpeg')}
              style={{
                position: "absolute",
                width: GameDimension.getWidth("now"),
                height: GameDimension.window().gameHeight,
              }}
              onLoadEnd={() => this.safeSetState({ loadingBG: false })}
            >
            </ImageBackground>
            <GameEngine
              ref={this.setEngineRef}
              onEvent={this.onGameEngineEvent}
              systems={[Physics.system]}
              entities={this.entities}
              style={{
                flex: 1,
                left: this.state.left,
              }} />
            <StatusBar hidden />
          </View>
        </TouchableWithoutFeedback>
        {
          this.state.loadingBG
            ? <View style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundColor: "black",
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}>
                <PulseIndicator color='white'/>
              </View>
            : null
        }
      </View>
    );
  }
}
