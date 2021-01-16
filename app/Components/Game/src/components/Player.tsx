import React, { createRef, MutableRefObject } from 'react';
import { Dimensions, Image, Platform } from 'react-native';
import { GameDimension } from '../utils/helpers/dimensions';
import SpriteSheet from '../utils/helpers/sprite-sheet';

import * as Circle from './Circle';

type Animation = { 
  idle: string, 
  fly: string,
  flyIdle: string,
  fall: string,
  fallIdle: string,
};

interface Props { setRef: ((ref: any) => void) | null; }

interface State {
  left: number;
  top: number;
  finish: boolean
  startSprite: (spriteRef: SpriteSheet | null) => void;
}

export default class Player extends React.Component<Circle.Props & Props, State> {
  spriteRef!: SpriteSheet;
  webSprite = Platform.OS === "web";
  prevSprite:  keyof Animation | null = null; // @remid clear this

  constructor(props: Circle.Props & Props) {
    super(props);
    const { gameHeight } = GameDimension.window();
    this.state = {
      left: gameHeight * 0.077,
      top: gameHeight * 0.0342,

      startSprite: this.idle,
      finish: true,
    }
  }

  componentDidMount() {
    console.log("PLAYER DID MOUNT");
    Dimensions.addEventListener('change', this.orientationCallback); // luckily this will not invoke in eg. landscape left to landscape right
    this.props.setRef ? this.props.setRef(this) : null;
  }

  componentWillUnmount() {
    console.log("PLAYER WILL UN-MOUNT")
    Dimensions.removeEventListener('change', this.orientationCallback);
    this.props.setRef ? this.props.setRef(null) : null; // setting game.playerRef to null
  }

  orientationCallback = () => {
    console.log("PLAYER ORIENT")
    const { gameHeight } = GameDimension.window();
    this.setState({
      left: gameHeight * 0.077,
      top: gameHeight * 0.0342,
    });
  }

  stopCurrentAnim = () => {
    this.setState({ finish: false });
    this.spriteRef.stop();
  }







  idle = (spriteRef: SpriteSheet | null) => {
    this.spriteRef = spriteRef!;
    (function initSprite(playerRef: Player) {
      if (Platform.OS === "web") { // i donno why but animation loop doesn't work in web, therefore just do it recursively
        playerRef.spriteRef?.play({
          type: "idle",
          fps: 12,
          loop: true,
        })
      }
    })(this);
  }



  fly = (spriteRef: SpriteSheet | null) => {
    this.spriteRef = spriteRef!;
    this.setState({ finish: true });
    (function initSprite(playerRef: Player) {
      if (Platform.OS === "web") { // i donno why but animation loop doesn't work in web, therefore just do it recursively
        playerRef.spriteRef?.play({
          type: "fly",
          fps: 25,
          loop: false,
          // onFinish: playerRef.flyIdle,
          onFinish: () => {
            playerRef.state.finish 
              ? (function initSprite() {
                  if (Platform.OS === "web") { // i donno why but animation loop doesn't work in web, therefore just do it recursively
                    playerRef.spriteRef?.play({
                      type: "flyIdle",
                      fps: 12,
                      loop: true,
                    })
                  }
                })() 
              : null;
          }
        })
      }
    })(this);
  }
  // flyIdle = () => {
  //   this.state.finish ? (function initSprite(playerRef: Player) {
  //     if (Platform.OS === "web") { // i donno why but animation loop doesn't work in web, therefore just do it recursively
  //       playerRef.spriteRef?.play({
  //         type: "flyIdle",
  //         fps: 12,
  //         loop: true,
  //       })
  //     }
  //   })(this) : null;
  // }


  fall = (spriteRef: SpriteSheet | null) => {
    this.spriteRef = spriteRef!;
    this.setState({ finish: true });
    (function initSprite(playerRef: Player) {
      if (Platform.OS === "web") { // i donno why but animation loop doesn't work in web, therefore just do it recursively
        playerRef.spriteRef?.play({
          type: "fall",
          fps: 15,
          loop: false,
          // onFinish: playerRef.fallIdle,
          onFinish: () => {
            playerRef.state.finish 
              ? (function initSprite() {
                  if (Platform.OS === "web") { // i donno why but animation loop doesn't work in web, therefore just do it recursively
                    playerRef.spriteRef?.play({
                      type: "fallIdle",
                      fps: 12,
                      loop: true,
                    })
                  }
                })() 
              : null;
          }
        })
      }
    })(this);
  }
  // fallIdle = () => {
  //   this.state.finish ? (function initSprite(playerRef: Player) {
  //     if (Platform.OS === "web") { // i donno why but animation loop doesn't work in web, therefore just do it recursively
  //       playerRef.spriteRef?.play({
  //         type: "fallIdle",
  //         fps: 12,
  //         loop: true,
  //       })
  //     }
  //   })(this) : null;
  // }











  render() {
    const
      left = this.state.left,
      top = this.state.top;
    return (
      <Circle.default {...this.props}>
        <SpriteSheet
          ref={this.state.startSprite} // if went error, i edited SpriteSheet index.d.ts

          source={require('../../assets/bally.png')}
          columns={8}
          rows={8}
          width={this.props.size * 2.7}
          viewStyle={{
            left: -left,
            top: -top,
          }}
          animations={{
            idle: [0, 1, 2, 3, 4, 5, 6, 7, 8],
            fly: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
            flyIdle: [26, 27, 28, 29, 30],
            fall: [
              // 31, 32, 33, 34, 
              35, 36, 37, 38, 39, 40, 
              41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
              51, 52, 53, 54, 55, 56
            ],
            fallIdle: [50, 51, 52, 53, 54, 55, 56],
          }} />
      </Circle.default>
    )
  }
}