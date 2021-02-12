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
  leftVal: number;
};

export default class Grass extends React.PureComponent<Box.Props & Props, any> { // @remind update state here
  private static readonly BASE_DURATION = 3000;
  private grassWidth = this.props.size[0];
  private grassA: GrassObject = {
    animation: null,
    leftVal: 0,
  } 
  private grassB: GrassObject = {
    animation: null,
    leftVal: this.props.size[0],
  } 

  constructor(props: Box.Props & Props) {
    super(props);
    const { gameHeight } = GameDimension.window();
    this.state = {
      grassAleft: new Animated.Value(this.grassA.leftVal),
      grassBleft: new Animated.Value(this.grassB.leftVal),
      grassAheight: 0.3,
      grassBheight: 0.3,
    }
  }

  componentDidMount() {
    console.log("GRASS DID MOUNT");
    this.props.setRef ? this.props.setRef(this) : null;
    Dimensions.addEventListener('change', this.orientationCallback); // luckily this will not invoke in eg. landscape left to landscape right
    this.move(); // @remind clear
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
      // useNativeDriver: false,
    });
  }

  move = () => {
    // const moveGrassA = () => {
    //   this.grassA.animation = this.animate(
    //     this.state.grassAleft,
    //     this.calcDuration(this.grassWidth, this.grassA.leftVal)
    //   );
    //   this.grassA.animation.start(({ finished }: any) => { // @remind refactore
    //     if (finished) {
    //       this.stop();
    //       this.grassA.leftVal = this.grassB.leftVal + this.grassWidth;
    //       this.state.grassAleft.setValue(this.grassA.leftVal);
    //       moveGrassA();
    //       moveGrassB();
    //     }
    //   });
    // }
    // moveGrassA();

    // const moveGrassB = () => {
    //   console.log("GRASSSSSSSSSSSSSSSSSSSSSSSSSS B: " + this.grassB.leftVal)
    //   this.grassB.animation = this.animate(
    //     this.state.grassBleft, // starting
    //     this.calcDuration(this.grassWidth, this.grassB.leftVal)
    //   );
    //   this.grassB.animation.start(({ finished }: any) => { // @remind refactore
    //     if (finished) {
    //       this.stop();
    //       this.grassB.leftVal = this.grassA.leftVal + this.grassWidth;
          // this.state.grassBleft.setValue(this.grassB.leftVal);

    //       moveGrassB();
    //       moveGrassA();
    //     }
    //   });
    // }
    // moveGrassB();

    // @remind clear
    // USING PARALLEL
    // const switching = (a = -this.grassWidth, b = 0)  => {
    //   this.grassA.animation = this.animate(
    //     this.state.grassAleft,
    //     this.calcDuration(this.grassWidth, 0), a
    //   );
    //   this.grassB.animation = this.animate(
    //     this.state.grassBleft, // starting
    //     this.calcDuration(this.grassWidth, 0), b
    //   );
    // }

    // const animate1 = () => {
    //   this.state.grassAleft.setValue(0);
    //   this.state.grassBleft.setValue(this.grassWidth);
    //   switching();
    //   Animated.parallel([
    //     this.grassA.animation,
    //     this.grassB.animation
    //   ]).start(({ finished }: any) => finished ? animate2() : null);
    // }
    // const animate2 = () => {
    //   this.state.grassAleft.setValue(this.grassWidth);
    //   this.state.grassBleft.setValue(0);
    //   switching(0, -this.grassWidth);
    //   Animated.parallel([
    //     this.grassA.animation,
    //     this.grassB.animation
    //   ]).start(({ finished }: any) => finished ? animate1() : null);
    // }
    // animate1();


    // @remind refactoring
    const switching = (toValue=[-this.grassWidth, 0], left=[0, this.grassWidth])  => {
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

    // const animate1 = () => {
    //   switching();
    //   Animated.parallel([
    //     this.grassA.animation,
    //     this.grassB.animation
    //   ]).start(({ finished }: any) => finished ? animate2() : null);
    // }
    // const animate2 = () => {
    //   switching([0, -this.grassWidth], [this.grassWidth, 0]);
    //   Animated.parallel([
    //     this.grassA.animation,
    //     this.grassB.animation
    //   ]).start(({ finished }: any) => finished ? animate1() : null);
    // }
    // animate1();

    let first = "grass-a"
    const animateGrass = () => {
      if (first === "grass-a") {
        first = "grass-b"
        switching()
      } else {
        first = "grass-a"
        switching([0, -this.grassWidth], [this.grassWidth, 0])
      }
      Animated.parallel([
        this.grassA.animation,
        this.grassB.animation
      ]).start(({ finished }: any) => finished ? animateGrass() : null);
    }
    animateGrass()

  }

  stop = () => {
    // this.state.grassAleft.stopAnimation((value: number) => this.grassA.leftVal = value);
    // this.state.grassBleft.stopAnimation((value: number) => this.grassB.leftVal = value);
    // @remind clear
    console.log("STOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOPPPP GRASSSSS")
    this.grassA.animation.stop()
    this.grassB.animation.stop()
  }

  render() {
    return (
      <Box.default {...this.props}>
        <Leaves left={this.state.grassAleft} randHeight={this.state.grassAheight} myColor={"red"} {...this.props}/>
        <Leaves left={this.state.grassBleft} randHeight={this.state.grassBheight} myColor={"yellow"} {...this.props}/>
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
