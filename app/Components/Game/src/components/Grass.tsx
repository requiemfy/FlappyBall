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

type GrassObject = {
  animation: any;
};

export default class Grass extends React.PureComponent<Box.Props & Props, any> { // @remind update state here
  private static readonly BASE_DURATION = 3000;
  private grassWidth = this.props.size[0];
  private firstGrass = "grass-a";
  private grassA: GrassObject = {
    animation: null,
  } 
  private grassB: GrassObject = {
    animation: null,
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
    return Grass.BASE_DURATION * percentage;
  }

  private animate(animatedVal: any, duration: number, toValue=-this.grassWidth ) {
    return Animated.timing(animatedVal, {
      toValue: toValue,
      duration: duration,
      easing: Easing.linear,
      useNativeDriver: !(Platform.OS === 'web'),
    });
  }

  private switching = (toValue=[-this.grassWidth, 0], left=[0, this.grassWidth])  => {
    this.state.grassAleft.setValue(left[0]);
    this.state.grassBleft.setValue(left[1]);
    this.grassA.animation = this.animate(
      this.state.grassAleft,
      this.calcDuration(this.grassWidth, 0), toValue[0]
    );
    this.grassB.animation = this.animate(
      this.state.grassBleft, // starting
      this.calcDuration(this.grassWidth, 0), toValue[1]
    );
  }

  private animateGrass = () => {
    if (this.firstGrass === "grass-a") {
      this.firstGrass = "grass-b"
      this.setState({ grassBheight: this.randomHeight() });
      this.switching()
    } else {
      this.firstGrass = "grass-a"
      this.setState({ grassAheight: this.randomHeight() });
      this.switching([0, -this.grassWidth], [this.grassWidth, 0])
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
        <Leaves left={this.state.grassAleft} randHeight={this.state.grassAheight} myColor={"transparent"} {...this.props}/>
        <Leaves left={this.state.grassBleft} randHeight={this.state.grassBheight} myColor={"transparent"} {...this.props}/>
      </Box.default>
    )
  }
}

class Leaves extends React.PureComponent<Box.Props & { left: any, randHeight: number, myColor: string }, {}> {

  componentDidMount() {
    console.log("CHECK MOUNTING LEAVES")
  }

  componentWillUnmount() {
    console.log("CHECK UNMOUNTING LEAVES")
  }

  render() {
    const 
      rand = Math.random(),
      height = this.props.size[1] * this.props.randHeight;

    console.log("RENDER HEIGHT " + height)
    return (
      <Animated.Image
        source={require('../../assets/grass.png')}
        style={[{
          position: "absolute",
          top: -height,
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
