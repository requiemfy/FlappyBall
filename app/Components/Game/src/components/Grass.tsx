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
  // stopAnimCallBack = false; // @remind clear

  // grassALeftVal = 0;
  // grassBLeftVal = this.props.size[0];

  private static readonly BASE_DURATION = 1000;

  private grassA: GrassObject = {
    animation: null,
    leftVal: 0,
  } 

  private grassB: GrassObject = {
    animation: null,
    leftVal: this.props.size[0],
  } 

  private grassWidth = this.props.size[0];

  // grassB = {
  //   animation: Animated.timing(this.state.grassAleft, {
  //     toValue: -this.props.size[0],
  //     duration: 5000,
  //     easing: Easing.linear,
  //     useNativeDriver: !(Platform.OS === 'web'),
  //   }),
  //   leftVal: this.props.size[0],
  // }

  constructor(props: Box.Props & Props) {
    super(props);
    const { gameHeight } = GameDimension.window();
    this.state = {
      // grassAleft: new Animated.Value(this.grassALeftVal),
      // grassBleft: new Animated.Value(this.grassBLeftVal),

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

  private static calcDuration(width: number, left: number) {
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
      useNativeDriver: !(Platform.OS === 'web'),
    });
  }

  move = () => {

    // const moveGrassA = (toValue: number, duration: number) => {
    //   Animated.timing(this.state.grassAleft, {
    //     toValue: toValue,
    //     duration: duration,
    //     easing: Easing.linear,
    //     useNativeDriver: true,
    //   }).start(({ finished }) => { // @remind refactore
    //     // if (!this.stopAnimCallBack) {
    //     //   // this.setState({ grassAleft: new Animated.Value(this.props.size[0]) });
    //     //   this.state.grassAleft.setValue(this.props.size[0])
    //     //   moveGrassA(-(this.props.size[0]), 10000);
    //     // }
    //     if (finished) {
    //       this.state.grassAleft.setValue(this.props.size[0]) // start to the right most blind spot of the screen
    //       moveGrassA(-this.props.size[0], 10000);
    //     }
    //   });
    // }
    // moveGrassA(-this.props.size[0], 5000);

    this.grassA.animation = this.animate(
      this.state.grassAleft,
      // (() => {
      //   const 
      //     distance = this.grassWidth + this.grassA.leftVal,
      //     percentage = distance / this.grassWidth;
      //   return 5000 * percentage;
      // })()
      Grass.calcDuration(this.grassWidth, this.grassA.leftVal)
    );
    this.grassA.animation.start(({ finished }: { finished: boolean }) => {
      if (finished) {
        Platform.OS === 'web'
          ? this.setState({ grassAleft: new Animated.Value(this.grassWidth) })
          : this.state.grassAleft.setValue(this.grassWidth); // for native driver
        this.grassA.animation = this.animate(this.state.grassAleft, Grass.BASE_DURATION * 2);

        // this.state.grassAleft.addListener(({ value }: any) => {
        //   console.log("X " + value)
        //   if (value <= -this.grassWidth) {
        //     this.stop()
        //     const rand = Math.random();
        //     this.setState({ grassAheight: (rand > 0.7 ? 0.7 : (rand < 0.3 ? 0.3 : rand)) });
        //     console.log("RENDER GRASS A HEIGHT please")
        //     // this.move()
        //   }
        // });

        Animated.loop(this.grassA.animation).start();
      }
    });




    // const moveGrassB = (toValue: number, duration: number) => {
    //   Animated.timing(this.state.grassBleft, {
    //     toValue: toValue,
    //     duration: duration,
    //     easing: Easing.linear,
    //     useNativeDriver: true,
    //   }).start(({ finished }) => {  // @remind refactore
    //     // if (!this.stopAnimCallBack) {
    //     //   // this.setState({ grassBleft: new Animated.Value(this.props.size[0]) });
    //     //   this.state.grassBleft.setValue(this.props.size[0])
    //     //   moveGrassB(-(this.props.size[0]));
    //     // }
    //     if (finished) {
    //       this.state.grassBleft.setValue(this.props.size[0]) // start to the right most blind spot of the screen
    //       moveGrassB(-this.props.size[0], 10000);
    //     }
    //   })
    // }
    // moveGrassB(-this.props.size[0], 10000);

    this.grassB.animation = this.animate(
      this.state.grassBleft,
      Grass.calcDuration(this.grassWidth, this.grassB.leftVal)
    );
    this.grassB.animation.start(({ finished }: { finished: boolean }) => {
      if (finished) {
        Platform.OS === 'web'
          ? this.setState({ grassBleft: new Animated.Value(this.grassWidth) })
          : this.state.grassBleft.setValue(this.grassWidth); // for native driver
        this.grassB.animation = this.animate(this.state.grassBleft, Grass.BASE_DURATION * 2);

        // this.state.grassBleft.addListener(({ value }: any) => {
        //   if (value <= -this.grassWidth) {
        //     this.stop()
        //     const rand = Math.random();
        //     this.setState({ grassBheight: (rand > 0.5 ? 0.5 : (rand < 0.3 ? 0.3 : rand)) });
        //     console.log("RENDER HEIGHT please")
        //     // this.move()
        //   }
        // });

        Animated.loop(this.grassB.animation).start();
      }
    });

  }

  // start = () => {
  //   // this.stopAnimCallBack = false; // @remind clear

  //   this.move();
  // }

  stop = () => {
    // this.stopAnimCallBack = true; // @remind clear

    this.state.grassAleft.stopAnimation((value: number) => this.grassA.leftVal = value);
    this.state.grassBleft.stopAnimation((value: number) => this.grassB.leftVal = value);
  }

  render() {
    return (
      <Box.default {...this.props}>
        <Leaves left={this.state.grassAleft} randHeight={this.state.grassAheight} myColor={"red"} {...this.props}/>
        <Leaves left={this.state.grassBleft} randHeight={this.state.grassBheight} myColor={"yellow"} {...this.props}/>

        {/* <GrassB grassBleft={this.state.grassBleft} {...this.props} /> */}
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

// class GrassB extends React.PureComponent<Box.Props & { grassBleft: any }, {}> {
//   render() {
//     return (
//       <Animated.Image
//         source={require('../../assets/grass.png')}
//         style={[{
//           position: "absolute",
//           top: 0,
//           left: this.props.grassBleft,
//           width: this.props.size[0],
//           height: 20,
//           backgroundColor: 'red',
//           resizeMode: "stretch"
//         }]}></Animated.Image>
//     )
//   }
// }