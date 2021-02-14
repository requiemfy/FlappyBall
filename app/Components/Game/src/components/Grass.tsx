import { number } from 'prop-types';
import React, { createRef, MutableRefObject } from 'react';
import { Animated, Easing, Dimensions, Image, Platform, TouchableWithoutFeedback } from 'react-native';
import { GameDimension } from '../utils/helpers/dimensions';
import { SCREEN_HEIGHT } from '../utils/world/constants';
import * as Box from './shapes/Box';

interface Props { setRef: ((ref: any) => void) | null; }

interface State {
  grassAleft: Animated.Value;
  grassBleft: Animated.Value;
  grassAheight: number;
  grassBheight: number;
}

type GrassObject = {
  animation: any;
  stoppedLeft: number;
  toValue: number;
};

export default class Grass extends React.PureComponent<Box.Props & Props, State> {
  private static readonly BASE_DURATION = 5000;
  private static readonly BASE_DISTANCE = 798;
  private grassWidth = GameDimension.window().gameHeight * 3;
  // private grassWidth = this.props.size[0];
  private firstGrass = "grass-a";
  private grassA: GrassObject = {
    animation: null,
    stoppedLeft: 0,
    toValue: -this.grassWidth,
  }
  private grassB: GrassObject = {
    animation: null,
    stoppedLeft: this.grassWidth,
    toValue: 0,
  }

  constructor(props: Box.Props & Props) {
    super(props);
    const { gameHeight } = GameDimension.window();
    this.state = {
      grassAleft: new Animated.Value(0),
      grassBleft: new Animated.Value(this.grassWidth),
      grassAheight: 0.3,
      grassBheight: 0.3,
      // 0.3 to 1.5 grass height
    }
  }

  componentDidMount() {
    console.log("GRASS DID MOUNT");
    this.props.setRef ? this.props.setRef(this) : null;
    Dimensions.addEventListener('change', this.orientationCallback); // luckily this will not invoke in eg. landscape left to landscape right
    this.state.grassAleft.addListener(({value}) => this.grassA.stoppedLeft = value);
    this.state.grassBleft.addListener(({value}) => this.grassB.stoppedLeft = value);
  }

  componentWillUnmount() {
    console.log("PLAYER WILL UN-MOUNT")
    this.props.setRef ? this.props.setRef(null) : null; // setting game.playerRef to null
    Dimensions.removeEventListener('change', this.orientationCallback);
    this.state.grassAleft.removeAllListeners();
    this.state.grassBleft.removeAllListeners();
  }

  private orientationCallback = () => {
    this.stop();
  }

  private calcDuration(width: number, left: number) {
    const
      distance = Math.abs(width + left),
      percentage = distance / Grass.BASE_DISTANCE;
    return Grass.BASE_DURATION * percentage;
  }

  private animate(animatedVal: any, duration: number, toValue = -this.grassWidth) {
    return Animated.timing(animatedVal, {
      toValue: toValue,
      duration: duration,
      easing: Easing.linear,
      useNativeDriver: !(Platform.OS === 'web'),
    });
  }

  private switching = (toValue = [-this.grassWidth, 0], left = [0, this.grassWidth]) => {
    this.grassA.toValue = toValue[0];
    this.grassB.toValue = toValue[1];
    this.state.grassAleft.setValue(left[0]);
    this.state.grassBleft.setValue(left[1]);
    this.setAnimGrassA(0, toValue[0]);
    this.setAnimGrassB(0, toValue[1]);
  }

  private swapGrass = () => { // putting front grass to back
    if (this.firstGrass === "grass-a") {
      this.firstGrass = "grass-b"
      this.setState({ grassBheight: this.randomHeight() });
      this.switching()
    } else {
      this.firstGrass = "grass-a"
      this.setState({ grassAheight: this.randomHeight() });
      this.switching([0, -this.grassWidth], [this.grassWidth, 0])
    }
  }

  private movingGrass = () => { // work recursively
    this.swapGrass();
    this.move();
  }

  private randomHeight = () => {
    const
      rand = Math.random(),
      h1 = rand <= 0.3 ? 0.3 : rand,
      h2 = h1 >= 0.9 ? 0.5 : 0;
    return h1 + h2;
  }

  private setAnimGrassA = (left: number, toValue: number) => {
    this.grassA.animation = this.animate(
      this.state.grassAleft,
      this.calcDuration(this.grassWidth, left), toValue
    );
  }

  private setAnimGrassB = (left: number, toValue: number) => {
    this.grassB.animation = this.animate(
      this.state.grassBleft, // starting
      this.calcDuration(this.grassWidth, left), toValue
    );
  }

  private resume = () => {
    const distanceA = this.grassA.stoppedLeft - this.grassA.toValue;
    const distanceB = this.grassB.stoppedLeft - this.grassB.toValue;
    this.setAnimGrassA(-(this.grassWidth + distanceA), this.grassA.toValue);
    this.setAnimGrassB(-(this.grassWidth + distanceB), this.grassB.toValue);
  }

  move = () => {
    this.resume();
    Animated.parallel([
      this.grassA.animation,
      this.grassB.animation
    ]).start(({ finished }: any) => finished ? this.movingGrass() : null);
  }

  stop = () => {
    this.grassA.animation?.stop()
    this.grassB.animation?.stop()
  }

  render() {
    return (
      <Box.default {...this.props}>
        <Leaves
          left={this.state.grassAleft}
          randHeight={this.state.grassAheight}
          myColor={"transparent"}
          width={this.grassWidth}
          {...this.props} 
        />
        <Leaves 
          left={this.state.grassBleft} 
          randHeight={this.state.grassBheight} 
          myColor={"transparent"} 
          width={this.grassWidth}
          {...this.props} 
        />
      </Box.default>
    )
  }
}

class Leaves extends React.PureComponent<
  Box.Props & 
  {
    left: any;
    randHeight: number;
    myColor: string;
    width: number;
  }, {}> {

  componentDidMount() {
    console.log("CHECK MOUNTING LEAVES")
  }

  componentWillUnmount() {
    console.log("CHECK UNMOUNTING LEAVES")
  }

  render() {
    const
      rand = Math.random(),
      // height = (GameDimension.window().gameHeight * 0.15) * this.props.randHeight;
      height = (this.props.size[1] * 0.9) * this.props.randHeight;
    return (
      <Animated.Image
        source={require('../../assets/grass.png')}
        style={[{
          position: "absolute",
          top: -height,
          width: this.props.width,
          height: height,
          backgroundColor: this.props.myColor,
          resizeMode: "stretch"
        },
        Platform.OS === 'web'
          ? { left: this.props.left, }
          : { transform: [{ translateX: this.props.left }] }
        ]}>
      </Animated.Image>
    )
  }
}
