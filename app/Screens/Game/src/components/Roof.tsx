import { ScaleFromCenterAndroid } from '@react-navigation/stack/lib/typescript/src/TransitionConfigs/TransitionPresets';
import { number } from 'prop-types';
import React, { createRef, MutableRefObject } from 'react';
import { Animated, Easing, Dimensions, Image, Platform, TouchableWithoutFeedback, ImageBackground } from 'react-native';
import { GameDimension } from '../utils/helpers/dimensions';
import { SCREEN_HEIGHT } from '../utils/world/constants';
import * as Box from './shapes/Box';

interface Props { setRef: ((ref: any) => void) | null; }

interface State {
  roofAleft: Animated.Value;
  roofBleft: Animated.Value;
  roofAvine: number,
  roofBvine: number,
}

type RoofObject = {
  animation: any;
  stoppedLeft: number;
  toValue: number;
};

export default class Roof extends React.PureComponent<Box.Props & Props, State> {
  private static readonly BASE_DURATION = 6000;
  private static readonly BASE_DISTANCE = 798;
  private roofWidth = GameDimension.getWidth("now");
  private firstRoof = "roof-a";
  private roofA: RoofObject = {
    animation: null,
    stoppedLeft: 0,
    toValue: -this.roofWidth,
  }
  private roofB: RoofObject = {
    animation: null,
    stoppedLeft: this.roofWidth,
    toValue: 0,
  }

  constructor(props: Box.Props & Props) {
    super(props);
    const { gameHeight } = GameDimension.window();
    this.state = {
      roofAleft: new Animated.Value(0),
      roofBleft: new Animated.Value(this.roofWidth),
      roofAvine: 1,
      roofBvine: 1,
    }
  }

  componentDidMount() {
    this.props.setRef ? this.props.setRef(this) : null;
    Dimensions.addEventListener('change', this.orientationCallback); // luckily this will not invoke in eg. landscape left to landscape right
    this.state.roofAleft.addListener(({value}) => this.roofA.stoppedLeft = value);
    this.state.roofBleft.addListener(({value}) => this.roofB.stoppedLeft = value);
  }

  componentWillUnmount() {
    this.props.setRef ? this.props.setRef(null) : null; // setting game.playerRef to null
    Dimensions.removeEventListener('change', this.orientationCallback);
    this.state.roofAleft.removeAllListeners();
    this.state.roofBleft.removeAllListeners();
  }

  private orientationCallback = () => {
    this.stop();

    this.roofWidth = GameDimension.getWidth("now");

    this.roofA.stoppedLeft = 0;
    this.roofA.toValue = -this.roofWidth;
    this.roofB.stoppedLeft = this.roofWidth;
    this.roofB.toValue = 0;

    this.state.roofAleft.setValue(0);
    this.state.roofBleft.setValue(this.roofWidth);

    this.setState({});
  }

  private calcDuration(width: number, left: number) {
    const
      distance = Math.abs(width + left),
      percentage = distance / Roof.BASE_DISTANCE;
    return Roof.BASE_DURATION * percentage;
  }

  private randomVine() {
    const 
      max = 5, // excluded
      min = 1; // included
    return Math.floor(Math.random() * (max - min) ) + min;
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
    this.roofB.toValue = toValue[1];
    this.state.roofAleft.setValue(left[0]);
    this.state.roofBleft.setValue(left[1]);
    this.setAnimRoofA(0, toValue[0]);
    this.setAnimRoofB(0, toValue[1]);
  }

  private swapRoof = () => {
    if (this.firstRoof === "roof-a") {
      this.firstRoof = "roof-b"
      this.setState({ roofBvine: this.randomVine() })
      this.switching()

    } else {
      this.firstRoof = "roof-a"
      this.setState({ roofAvine: this.randomVine() })
      this.switching([0, -this.roofWidth], [this.roofWidth, 0])
    }
  }

  private movingRoof = () => { // work recursively
    this.swapRoof();
    this.move();
  }

  private setAnimRoofA = (left: number, toValue: number) => {
    this.roofA.animation = this.animate(
      this.state.roofAleft,
      this.calcDuration(this.roofWidth, left), toValue
    );
  }

  private setAnimRoofB = (left: number, toValue: number) => {
    this.roofB.animation = this.animate(
      this.state.roofBleft, // starting
      this.calcDuration(this.roofWidth, left), toValue
    );
  }

  private resume = () => {
    const distanceA = this.roofA.stoppedLeft - this.roofA.toValue;
    const distanceB = this.roofB.stoppedLeft - this.roofB.toValue;
    this.setAnimRoofA(-(this.roofWidth + distanceA), this.roofA.toValue);
    this.setAnimRoofB(-(this.roofWidth + distanceB), this.roofB.toValue);
  }

  move = () => {
    this.resume();
    Animated.parallel([
      this.roofA.animation,
      this.roofB.animation
    ]).start(({ finished }: any) => finished ? this.movingRoof() : null);
  }

  stop = () => {
    this.roofA.animation?.stop()
    this.roofB.animation?.stop()
  }

  render() {
    return (
      <Box.default {...this.props}>
        <Image // background image of roof
          source={require('../../assets/vines/static.png')}
          style={{
            position: 'absolute',
            width: this.props.size[0],
            height: this.props.size[1] * 2,
            top: this.props.size[1] * 0.25,
            resizeMode: 'stretch',
            zIndex: 99999,
          }}
        />
        <Vines
          left={this.state.roofAleft}
          myColor={"transparent"}
          width={this.roofWidth}
          vine={this.state.roofAvine}
          {...this.props} 
        />
        <Vines 
          left={this.state.roofBleft} 
          myColor={"transparent"} 
          width={this.roofWidth}
          vine={this.state.roofBvine}
          {...this.props} 
        />
      </Box.default>
    )
  }
}

class Vines extends React.PureComponent<
  Box.Props & 
  {
    left: any;
    myColor: string; // actually this is only for testing purposes, but just leave it here
    width: number;
    vine: number;
  }, {}> {

  render() {
    let 
      height = this.props.size[1], 
      top = this.props.size[1], 
      vine = require('../../assets/vines/1.png');

    switch (this.props.vine) {
      case 1:
        height *= 5;
        top *= 0.5;
        vine = require('../../assets/vines/1.png');
        break;
      case 2:
        height *= 4;
        top = -top * 0.5;
        vine = require('../../assets/vines/2.png');
        break;
      case 3:
        height *= 3;
        top -= (top * 0.2)
        vine = require('../../assets/vines/3.png');
        break;
      case 4:
        height *= 5;
        top -= (top * 0.2);
        vine = require('../../assets/vines/4.png');
        break;
      default:
        break;
    }

    return (
      <Animated.Image
        source={vine}
        resizeMethod={"resize"} // for orientation change response of image
        style={[{
          position: "absolute",
          top: top,
          width: this.props.width,
          height: height,
          backgroundColor: this.props.myColor,
          resizeMode: "repeat",
          zIndex: -1,
        },
        Platform.OS === 'web'
          ? { left: this.props.left, }
          : { transform: [{ translateX: this.props.left }] }
        ]}>
      </Animated.Image>
    )
  }
}
