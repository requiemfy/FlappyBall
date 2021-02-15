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
}

type GrassObject = {
  animation: any;
  stoppedLeft: number;
  toValue: number;
};

export default class Roof extends React.PureComponent<Box.Props & Props, State> {
  private static readonly BASE_DURATION = 5000;
  private static readonly BASE_DISTANCE = 798;
  private roofWidth = GameDimension.window().gameHeight * 3;
  // private roofWidth = this.props.size[0];
  private firstRoof = "roof-a";
  private roofA: GrassObject = {
    animation: null,
    stoppedLeft: 0,
    toValue: -this.roofWidth,
  }
  private grassB: GrassObject = {
    animation: null,
    stoppedLeft: this.roofWidth,
    toValue: 0,
  }

  constructor(props: Box.Props & Props) {
    super(props);
    const { gameHeight } = GameDimension.window();
    this.state = {
      grassAleft: new Animated.Value(0),
      grassBleft: new Animated.Value(this.roofWidth),
    }
  }

  componentDidMount() {
    this.props.setRef ? this.props.setRef(this) : null;
    Dimensions.addEventListener('change', this.orientationCallback); // luckily this will not invoke in eg. landscape left to landscape right
    this.state.grassAleft.addListener(({value}) => this.roofA.stoppedLeft = value);
    this.state.grassBleft.addListener(({value}) => this.grassB.stoppedLeft = value);

    this.move();
  }

  componentWillUnmount() {
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
      percentage = distance / Roof.BASE_DISTANCE;
    return Roof.BASE_DURATION * percentage;
  }

  private animate(animatedVal: any, duration: number, toValue = -this.roofWidth) {
    return Animated.timing(animatedVal, {
      toValue: toValue,
      duration: duration,
      easing: Easing.linear,
      useNativeDriver: !(Platform.OS === 'web'),
    });
  }

  private switching = (toValue = [-this.roofWidth, 0], left = [0, this.roofWidth]) => {
    this.roofA.toValue = toValue[0];
    this.grassB.toValue = toValue[1];
    this.state.grassAleft.setValue(left[0]);
    this.state.grassBleft.setValue(left[1]);
    this.setAnimGrassA(0, toValue[0]);
    this.setAnimGrassB(0, toValue[1]);
  }

  private swapGrass = () => {
    if (this.firstRoof === "roof-a") {
      this.firstRoof = "roof-b"
      this.switching()
    } else {
      this.firstRoof = "roof-a"
      this.switching([0, -this.roofWidth], [this.roofWidth, 0])
    }
  }

  private movingGrass = () => { // work recursively
    this.swapGrass();
    this.move();
  }

  private setAnimGrassA = (left: number, toValue: number) => {
    this.roofA.animation = this.animate(
      this.state.grassAleft,
      this.calcDuration(this.roofWidth, left), toValue
    );
  }

  private setAnimGrassB = (left: number, toValue: number) => {
    this.grassB.animation = this.animate(
      this.state.grassBleft, // starting
      this.calcDuration(this.roofWidth, left), toValue
    );
  }

  private resume = () => {
    const distanceA = this.roofA.stoppedLeft - this.roofA.toValue;
    const distanceB = this.grassB.stoppedLeft - this.grassB.toValue;
    this.setAnimGrassA(-(this.roofWidth + distanceA), this.roofA.toValue);
    this.setAnimGrassB(-(this.roofWidth + distanceB), this.grassB.toValue);
  }

  move = () => {
    this.resume();
    Animated.parallel([
      this.roofA.animation,
      this.grassB.animation
    ]).start(({ finished }: any) => finished ? this.movingGrass() : null);
  }

  stop = () => {
    this.roofA.animation?.stop()
    this.grassB.animation?.stop()
  }

  render() {
    return (
      <Box.default {...this.props}>
        <Leaves
          left={this.state.grassAleft}
          myColor={"transparent"}
          width={this.roofWidth}
          {...this.props} 
        />
        <Leaves 
          left={this.state.grassBleft} 
          myColor={"transparent"} 
          width={this.roofWidth}
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
    myColor: string;
    width: number;
  }, {}> {

  componentDidMount() {
    console.log("CHECK MOUNTING LEAVES")
  }

  componentWillUnmount() {
    console.log("CHECK UNMOUNTING LEAVES")
  }

  // height
  // 1 = * 5

  render() {
    const
      rand = Math.random(),
      // height = (GameDimension.window().gameHeight * 0.15) * this.props.randHeight;
      height = this.props.size[1] * 5;
    return (
      <Animated.Image
        source={require('../../assets/vines/1.png')}
        style={[{
          position: "absolute",
          top: this.props.size[1] * 0.5,
          width: this.props.width,
          height: height,
          backgroundColor: this.props.myColor,
          resizeMode: "repeat"
        },
        Platform.OS === 'web'
          ? { left: this.props.left, }
          : { transform: [{ translateX: this.props.left }] }
        ]}>
      </Animated.Image>
    )
  }
}
