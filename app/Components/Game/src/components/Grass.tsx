import React, { createRef, MutableRefObject } from 'react';
import { Animated, Easing, Dimensions, Image, Platform } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { GameDimension } from '../utils/helpers/dimensions';
import SpriteSheet from '../utils/helpers/sprite-sheet';
import * as Box from './shapes/Box';

interface Props { setRef: ((ref: any) => void) | null; }

interface State {
  left: any;
  top: number;
}

export default class Grass extends React.PureComponent<Box.Props & Props, any> {
  // spriteRef: SpriteSheet | null = null;

  constructor(props: Box.Props & Props) {
    super(props);
    const { gameHeight } = GameDimension.window();
    this.state = {

      // left: gameHeight * 0.077,
      // top: gameHeight * 0.0342,

      grassAleft: new Animated.Value(0),
      grassBleft: new Animated.Value(this.props.size[0]),

      // top: 0,

    }
  }

  componentDidMount() {
    console.log("GRASS DID MOUNT");
    // Dimensions.addEventListener('change', this.orientationCallback); // luckily this will not invoke in eg. landscape left to landscape right
    this.props.setRef ? this.props.setRef(this) : null;
    this.move();
  }

  componentWillUnmount() {
    console.log("PLAYER WILL UN-MOUNT")
    // Dimensions.removeEventListener('change', this.orientationCallback);
    this.props.setRef ? this.props.setRef(null) : null; // setting game.playerRef to null
    // this.spriteRef = null;
  }

  // orientationCallback = () => {
  //   console.log("PLAYER ORIENT")
  //   const { gameHeight } = GameDimension.window();
  //   this.setState({
  //     left: gameHeight * 0.077,
  //     top: gameHeight * 0.0342,
  //   });
  // }

  move = () => {
    const moveGrassA = (toValue: number, duration: number) => {
      Animated.timing(this.state.grassAleft, {
        toValue: toValue,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        console.log("WTF")
        this.setState({ grassAleft: new Animated.Value(this.props.size[0]) });
        moveGrassA(-(this.props.size[0]), 10000)
      });
    }
    moveGrassA(-this.props.size[0], 5000);

    const moveGrassB = (toValue: number) => {
      Animated.timing(this.state.grassBleft, {
        toValue: toValue,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        this.setState({ grassBleft: new Animated.Value(this.props.size[0]) });
        moveGrassB(-(this.props.size[0]))
      })
    }
    moveGrassB(-(this.props.size[0]));
  }

  

  render() {
    return (
      <Box.default {...this.props}>
        {/* <SpriteSheet
          ref={this.state.startSprite} // if went error, i edited SpriteSheet index.d.ts
          source={require('../../assets/grass.png')}
          columns={1}
          rows={19}

          height={30}

          // width={this.props.size * 2.7}
          viewStyle={{
            left: -left,
            top: -top,
            backgroundColor: "yellow",
          }}

          animations={{
            move: [
              0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 
              10, 11, 12, 13, 14, 15, 16, 17, 18, 19
            ]
          }} /> */}

      {/* <Animated.Image
        source={require('../../assets/grass.png')}
        style={[{
          top: 0,
          left: this.state.grassAleft,
          // width: Dimensions.get('screen').width * 1.5,
          // width: "100%",
          width: this.props.size[0],
          height: 20,
          backgroundColor: "yellow",
          resizeMode: "stretch"
        }]}></Animated.Image> */}
     
      {/* <Animated.Image
        source={require('../../assets/grass.png')}
        style={[{
          top: 0,
          left: this.state.grassBleft,
          // width: Dimensions.get('screen').width * 1.5,
          // width: "100%",
          width: this.props.size[0],
          height: 20,
          backgroundColor: 'red',
          resizeMode: "stretch"
        }]}></Animated.Image> */}

        <GrassA grassAleft={this.state.grassAleft} width={this.props.size[0]}/>
        <GrassB grassBleft={this.state.grassBleft} {...this.props}/>
      </Box.default>
    )
  }
}


class GrassB extends React.PureComponent< Box.Props & { grassBleft: any }, {}> {
  render() {
    return (
      <Animated.Image
        source={require('../../assets/grass.png')}
        style={[{
          position: "absolute",
          top: 0,
          left: this.props.grassBleft,
          // width: Dimensions.get('screen').width * 1.5,
          // width: "100%",
          width: this.props.size[0],
          height: 20,
          backgroundColor: 'red',
          resizeMode: "stretch"
        }]}></Animated.Image>
    )
  }
}

class GrassA extends React.PureComponent<{ grassAleft: any, width: number }, {}> {
  render() {
    return (
      <Animated.Image
        source={require('../../assets/grass.png')}
        style={[{
          position: "absolute",
          top: 0,
          left: this.props.grassAleft,
          // width: Dimensions.get('screen').width * 1.5,
          // width: "100%",
          width: this.props.width,
          height: 20,
          backgroundColor: "yellow",
          resizeMode: "stretch"
        }]}></Animated.Image>
    )
  }
}