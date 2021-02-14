import { any } from 'prop-types';
import React, { createRef, MutableRefObject } from 'react';
import { Animated, Easing, Dimensions, Image, Platform, TouchableWithoutFeedback } from 'react-native';
// import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { GameDimension } from '../utils/helpers/dimensions';
import SpriteSheet from '../utils/helpers/sprite-sheet';
import * as Box from './shapes/Box';

interface Props { setRef: ((ref: any) => void) | null; }

interface State {
  left: any;
  top: number;
}

type RoofObj = {
  animation: any;
};

export default class Roof extends React.PureComponent<Box.Props & Props, any> { // @remind update state here
  private static readonly BASE_DURATION = 3000;
  private roofWidth = this.props.size[0];
  private firstRoof = "roof-a";
  private grassA: RoofObj = {
    animation: null,
  } 
  private grassB: RoofObj = {
    animation: null,
  } 

  constructor(props: Box.Props & Props) {
    super(props);
    const { gameHeight } = GameDimension.window();
    this.state = {
      roofAleft: new Animated.Value(0),
      roofBleft: new Animated.Value(this.roofWidth),
      grassAheight: 4,
      grassBheight: 4,
      // 0.3 to 1.5 roof height
    }
  }

  componentDidMount() {
    console.log("ROOF DID MOUNT");
    this.props.setRef ? this.props.setRef(this) : null;
    Dimensions.addEventListener('change', this.orientationCallback); // luckily this will not invoke in eg. landscape left to landscape right
    this.move();
  }

  componentWillUnmount() {
    console.log("PLAYER WILL UN-MOUNT")
    this.props.setRef ? this.props.setRef(null) : null; // setting game.playerRef to null
    Dimensions.removeEventListener('change', this.orientationCallback);
  }

  private orientationCallback = () => {
    console.log("PLAYER ORIENT");
    this.stop();
  }

  private calcDuration(width: number, left: number) {
    const 
      distance = width + left,
      percentage = distance / width;
    return Roof.BASE_DURATION * percentage;
  }

  private animate(animatedVal: any, duration: number, toValue=-this.roofWidth ) {
    return Animated.timing(animatedVal, {
      toValue: toValue,
      duration: duration,
      easing: Easing.linear,
      useNativeDriver: !(Platform.OS === 'web'),
    });
  }

  private switching = (toValue=[-this.roofWidth, 0], left=[0, this.roofWidth])  => {
    this.state.roofAleft.setValue(left[0]);
    this.state.roofBleft.setValue(left[1]);
    this.grassA.animation = this.animate(
      this.state.roofAleft,
      this.calcDuration(this.roofWidth, 0), toValue[0]
    );
    this.grassB.animation = this.animate(
      this.state.roofBleft, // starting
      this.calcDuration(this.roofWidth, 0), toValue[1]
    );
  }

  private animateGrass = () => {
    if (this.firstRoof === "roof-a") {
      this.firstRoof = "roof-b"
      // this.setState({ grassBheight: this.randomHeight() });
      this.switching()
    } else {
      this.firstRoof = "roof-a"
      // this.setState({ grassAheight: this.randomHeight() });
      this.switching([0, -this.roofWidth], [this.roofWidth, 0])
    }
    Animated.parallel([
      this.grassA.animation,
      this.grassB.animation
    ]).start(({ finished }: any) => finished ? this.animateGrass() : null);
  }

  private randomHeight = () => {
    const 
      rand = Math.random(),
      h1 = rand <= 0.3 ? 0.3 : rand,
      h2 = h1 >= 0.9 ? 0.5 : 0;
    return h1 + h2;
  }

  move = () => {
    this.animateGrass()
  }

  stop = () => {
    this.grassA.animation?.stop()
    this.grassB.animation?.stop()
  }

  render() {
    return (
      <Box.default {...this.props}>
        <Vines left={this.state.roofAleft} randHeight={this.state.grassAheight} myColor={"transparent"} {...this.props}/>
        <Vines left={this.state.roofBleft} randHeight={this.state.grassBheight} myColor={"transparent"} {...this.props}/>
      </Box.default>
    )
  }
}

// 1 = 5, 0.05
// 2 = 4, 0.15


class Vines extends React.PureComponent<Box.Props & { 
    left: any, 
    randHeight: number, 
    myColor: string 
  }, {}> {

  componentDidMount() {
    console.log("CHECK MOUNTING Vines")
  }

  componentWillUnmount() {
    console.log("CHECK UNMOUNTING Vines")
  }

  render() {
    const 
      rand = Math.random(),
      height = this.props.size[1] * this.props.randHeight;

    console.log("RENDER ROOF " + height)
    return (
      <Animated.Image
        source={require('../../assets/vines/3.png')}
        style={[{
          position: "absolute",
          top: -height * 0.1,
          width: this.props.size[0],
          height: height,
          backgroundColor: this.props.myColor,
          resizeMode: "stretch"
        }, 
        Platform.OS === 'web'
          ? {left: this.props.left,}
          : {transform: [{translateX: this.props.left}]}
      ]}></Animated.Image>
    )
  }
}
