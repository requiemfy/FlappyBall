import React, { createRef, MutableRefObject } from 'react';
import { Dimensions, Image, Platform } from 'react-native';
import { GameDimension } from '../utils/helpers/dimensions';
import SpriteSheet from '../utils/helpers/sprite-sheet';

import * as Circle from './Circle';

type Animation = { 
  idle: string, 
  fly: string,
  flyIdle: string,
};

interface Props { setRef: ((ref: any) => void) | null; }

interface State {
  left: number;
  top: number;
  sprite: { 
    anim: keyof Animation,
    fps: number,
  };
}

export default class Player extends React.Component<Circle.Props & Props, State> {
  spriteRef!: SpriteSheet;
  // sprite: { 
  //   anim: keyof { 
  //     idle: string, 
  //     fly: string 
  //   },
  //   fps: number,
  // } = { anim: "idle", fps: 12 };
  webSprite = Platform.OS === "web";
  prevSprite:  keyof Animation | null = null;

  constructor(props: Circle.Props & Props) {
    super(props);
    const { gameHeight } = GameDimension.window();
    this.state = {
      left: gameHeight * 0.077,
      top: gameHeight * 0.0342,
      sprite: { anim: "idle", fps: 12}
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

  initSprite = (spriteRef: SpriteSheet | null) => {
    this.spriteRef = spriteRef!;
    (function initSprite(playerRef: Player) {
      if (Platform.OS === "web") { // i donno why but animation loop doesn't work in web, therefore just do it recursively
        playerRef.spriteRef?.play({
          type: playerRef.state.sprite.anim,
          fps: playerRef.state.sprite.fps,
          loop: false,
          onFinish: () => {
            if (playerRef.webSprite) {
              if (playerRef.prevSprite === "fly") {
                playerRef.prevSprite = playerRef.state.sprite.anim;
                playerRef.setState({ sprite: { anim: "flyIdle", fps: 12 } });
              } 
              playerRef.prevSprite = playerRef.state.sprite.anim;
              initSprite(playerRef)
            }
          },
        })
      }
      else 
        playerRef.spriteRef?.play({
          type: "idle",
          fps: 12,
          loop: true,
        });
    })(this);
  }

  // flySprite = () => {
  //   (function fly(playerRef: Player) {
  //     if (Platform.OS === "web") // i donno why but animation loop doesn't work in web, therefore just do it recursively
  //       playerRef.spriteRef?.play({
  //         type: "fly",
  //         fps: 12,
  //         loop: false,
  //         onFinish: () => playerRef.webSprite ? fly(playerRef) : null,
  //       })
  //   })(this);
  // }

  render() {
    const
      left = this.state.left,
      top = this.state.top;
    return (
      <Circle.default {...this.props}>
        <SpriteSheet
          ref={this.initSprite} // if went error, i edited SpriteSheet index.d.ts
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
          }} />
      </Circle.default>
    )
  }
}