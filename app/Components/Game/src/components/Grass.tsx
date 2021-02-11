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
  listener: any; // @remind check
};

export default class Grass extends React.PureComponent<Box.Props & Props, any> { // @remind update state here
  private static readonly BASE_DURATION = 1000;
  private grassWidth = this.props.size[0];
  private grassA: GrassObject = {
    animation: null,
    leftVal: 0,
    listener: null, // @remind check
  } 
  private grassB: GrassObject = {
    animation: null,
    leftVal: this.props.size[0],
    listener: null,  // @remind check
  } 

  constructor(props: Box.Props & Props) {
    super(props);
    const { gameHeight } = GameDimension.window();
    this.state = {
      // @remind check
      // grassAleft: new Animated.Value(this.grassALeftVal),
      // grassBleft: new Animated.Value(this.grassBLeftVal),

      grassAleft: new Animated.Value(this.grassA.leftVal),
      grassBleft: new Animated.Value(this.grassB.leftVal),
      grassAheight: 0.3,
      grassBheight: 0.3,
    }

    // @remind check
    // this.state.grassAleft.addListener(({value}: any) => this.grassA.leftVal = value);
    // this.state.grassBleft.addListener(({value}: any) => this.grassB.leftVal = value);
  }


  componentDidMount() {
    console.log("GRASS DID MOUNT");
    this.props.setRef ? this.props.setRef(this) : null;
    Dimensions.addEventListener('change', this.orientationCallback); // luckily this will not invoke in eg. landscape left to landscape right
    this.move(); // @remind clear

    // @remind clear
    // setTimeout(() => {
    //   this.grassA.animation.stop(() => {console.log("AAAAAAAAAAAAAAAAWDADASDSADSDDSASDADASD")});
    // }, 2000);

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

  private animate(animatedVal: any, duration: number) {
    return Animated.timing(animatedVal, {
      toValue: -this.grassWidth,
      duration: duration,
      easing: Easing.linear,
      // useNativeDriver: !(Platform.OS === 'web'),
      useNativeDriver: false,
    });
  }

  move = () => {

    // const grassAmove = () => {
    //   this.grassA.animation = this.animate(
    //     this.state.grassAleft,
    //     this.calcDuration(this.grassWidth, this.grassA.leftVal)
    //   );
    //   this.grassA.animation.start(
    //     ({ finished }: { finished: boolean }) => {
    //       if (finished) {

    //         Platform.OS === 'web'
    //           ? this.setState({ grassAleft: new Animated.Value(this.grassWidth) })
    //           : this.state.grassAleft.setValue(this.grassWidth); // for native driver
    //         this.grassA.animation = this.animate(this.state.grassAleft, Grass.BASE_DURATION * 2);

    //         // // const rand = Math.random();
    //         // // this.setState({ grassAheight: (rand > 0.7 ? 0.7 : (rand < 0.3 ? 0.3 : rand)) });
    //         // // console.log("RENDER GRASS A HEIGHT please")

    //         Animated.loop(this.grassA.animation).start();
    //       }
    //     }
    //   );
    // }
    // grassAmove();
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const moveGrassA = () => {
      this.grassA.animation = this.animate(
        this.state.grassAleft,
        this.calcDuration(this.grassWidth, this.grassA.leftVal)
        // Grass.BASE_DURATION
      );


      this.grassA.animation.start(({ finished }: any) => { // @remind refactore
        if (finished) {
          this.stop();

          this.grassA.leftVal = this.grassB.leftVal + this.grassWidth;
          // this.grassA.leftVal = (
          //   !(Platform.OS === 'web')
          //     ? this.grassB.leftVal
          //     : this.state.grassBleft._value
          //   ) + this.grassWidth; // for duration

          this.state.grassAleft.setValue(this.grassA.leftVal);
          // this.setState({ grassAleft: new Animated.Value(this.grassA.leftVal) });

          moveGrassA();
          moveGrassB();
        }
      });
    }
    moveGrassA();

    // this.grassB.animation = this.animate(
    //   this.state.grassBleft,
    //   this.calcDuration(this.grassWidth, this.grassB.leftVal)
    // );
    // this.grassB.animation.start(({ finished }: { finished: boolean }) => {
    //   if (finished) {
    //     Platform.OS === 'web'
          // ? this.setState({ grassBleft: new Animated.Value(this.grassWidth) })
    //       : this.state.grassBleft.setValue(this.grassWidth); // for native driver
    //     this.grassB.animation = this.animate(this.state.grassBleft, Grass.BASE_DURATION * 2);

    //     Animated.loop(this.grassB.animation).start();
    //   }
    // });
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const moveGrassB = () => {
      console.log("GRASSSSSSSSSSSSSSSSSSSSSSSSSS B: " + this.grassB.leftVal)
      this.grassB.animation = this.animate(
        this.state.grassBleft, // starting
        this.calcDuration(this.grassWidth, this.grassB.leftVal)
        // Grass.BASE_DURATION
      );
      this.grassB.animation.start(({ finished }: any) => { // @remind refactore
        if (finished) {
          this.stop();

          this.grassB.leftVal = this.grassA.leftVal + this.grassWidth;
          // this.grassB.leftVal = (
          //   !(Platform.OS === 'web')
          //     ? this.grassA.leftVal
          //     : this.state.grassAleft._value
          //   ) + this.grassWidth; // for duration
            
          this.state.grassBleft.setValue(this.grassB.leftVal);
          // this.setState({ grassBleft: new Animated.Value(this.grassB.leftVal) });

          moveGrassB();
          moveGrassA();
        }
      });
    }
    moveGrassB();


    // @remind clear
    // // USING PARALLEL
    // this.grassA.animation = this.animate(
    //   this.state.grassAleft,
    //   this.calcDuration(this.grassWidth, this.grassA.leftVal)
    // );

    // this.grassB.animation = this.animate(
    //   this.state.grassBleft, // starting
    //   this.calcDuration(this.grassWidth, this.grassB.leftVal)
    // );

    // Animated.parallel([
    //   this.grassA.animation,
    //   this.grassB.animation
    // ]).start();

  }

  stop = () => {
    this.state.grassAleft.stopAnimation((value: number) => this.grassA.leftVal = value);
    this.state.grassBleft.stopAnimation((value: number) => this.grassB.leftVal = value);
    // @remind clear
    // this.grassA.animation.stop()
    // this.grassB.animation.stop()
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
