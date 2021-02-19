import React, { createRef, MutableRefObject } from 'react';
import { Dimensions, Image, Platform } from 'react-native';
import { GameDimension } from '../utils/helpers/dimensions';
import SpriteSheet from '../utils/helpers/sprite-sheet';
import * as Circle from './shapes/Circle';

interface Props { setRef: ((ref: any) => void) | null; }

interface State {
  left: number;
  top: number;
  startSprite: (spriteRef: SpriteSheet | null) => void;
}

export default class Player extends React.Component<Circle.Props & Props, State> {
  spriteRef: SpriteSheet | null = null;

  constructor(props: Circle.Props & Props) {
    super(props);
    const { gameHeight } = GameDimension.window();
    this.state = {
      left: gameHeight * 0.077,
      top: gameHeight * 0.0342,
      startSprite: this.idle,
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
    this.stopCurrentAnim();
    this.props.setRef ? this.props.setRef(null) : null; // setting game.playerRef to null
    this.spriteRef = null;
  }

  private orientationCallback = () => {
    console.log("PLAYER ORIENT");
    this.stopCurrentAnim();
    const { gameHeight } = GameDimension.window();
    this.setState({
      left: gameHeight * 0.077,
      top: gameHeight * 0.0342,
    });
  }

  stopCurrentAnim = () => {
    this.spriteRef!.stop();
    this.spriteRef!.time.setValue(0); // this nigga here is needed for idle sprite, index 0 of idle causes error when using loop
  }

  playSprite = (type: string, fps: number, loop: boolean, cb = ({ finished }: { finished: boolean }) => {}) => {
    this.spriteRef?.play({
      type: type,
      fps: fps,
      loop: loop,
      onFinish: cb

    })
  }

  idle = (spriteRef: SpriteSheet | null) => {
    this.spriteRef = spriteRef!;
    this.playSprite("idle", 12, true);
  }
  // // optional animation, not really used for now
  // fly = (spriteRef: SpriteSheet | null) => {
  //   this.setSpriteRef(spriteRef);
  //   this.playSprite(
  //     "fly", 25, false,
  //     ({ finished }) => finished ? this.playSprite("flyIdle", 12, true) : null
  //   );
  // }
  // // optional animation
  // fall = (spriteRef: SpriteSheet | null) => {
  //   this.setSpriteRef(spriteRef);
  //   this.playSprite(
  //     "flyReverse", 60, false, 
  //     ({ finished }) => 
  //       finished 
  //         ? this.playSprite(
  //             "fall", 15, false, 
  //             ({ finished }) => finished ? this.playSprite("fallIdle", 12, true) : null
  //           )
  //         : null
  //   );
  // }

  reverse = (spriteRef: SpriteSheet | null, type: string, fps: number, cb = ({ finished }: { finished: boolean }) => {}) => {
    this.spriteRef = spriteRef!;

    this.spriteRef?.reverse({
      type: type,
      fps: fps,
      onFinish: cb
    });
  }

  reverseFlyThenFall = (spriteRef: SpriteSheet | null) => {
    this.reverse(
      spriteRef, "fly", 200,
      ({ finished }) =>
        finished
          ? this.playSprite(
              "fall", 15, false,
              ({ finished }) => finished ? this.playSprite("fallIdle", 12, true) : null
            )
          : null
    );
  }

  reverseFallThenFly = (spriteRef: SpriteSheet | null) => {
    this.reverse(
      spriteRef, "fall", 200,
      ({ finished }) => 
        finished 
          ? this.playSprite(
              "fly", 25, false,
              ({ finished }) => finished? this.playSprite("flyIdle", 12, true) : null
            )
          : null
    );
  }

  collided = (spriteRef: SpriteSheet | null) => {
    this.spriteRef = spriteRef!;
    this.playSprite(
      "collided", 10, false,
      () => this.playSprite("dead", 1, false) // this is for the purpose of not going to reset the frame, since if we change orientation, frame will render again from 1st
    );
  }

  render() {
    const
      left = this.state.left,
      top = this.state.top;
    return (
      <Circle.default {...this.props}>
        <SpriteSheet
          ref={this.state.startSprite} // if went error, i edited SpriteSheet index.d.ts
          source={require('../../assets/bally.png')}
          columns={9}
          rows={10}
          width={this.props.size * 2.7}
          viewStyle={{
            left: -left,
            top: -top,
          }}
          animations={{
            idle: [0, 1, 2, 3, 4, 5, 6, 7, 8],
            // -------------------------------------------
            fly: [
              // 9, 10, 11, 
              12, 13, 14, 15, 16, 17, 18, 19, 20, 
              21, 22, 23, 24, 25, 26, 27, 28, 29, 30
            ],
            flyIdle: [26, 27, 28, 29, 30],
            flyReverse: [
              30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 
              20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 
              10, 9
            ],
            // -------------------------------------------
            fall: [
              // 31, 32, 
              33, 34, 
              35, 36, 37, 38, 39, 40, 
              41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
              51, 52, 53, 54, 55, 56
            ],
            fallIdle: [50, 51, 52, 53, 54, 55, 56],

            collided: [
              57, 58, 59, 60, 
              61, 62, 63, 64, 65, 66, 67, 68, 69, 70,
              71, 72, 73, 74, 75, 76, 77, 78, 79, 80
            ],
            dead: [80]
          }} />
      </Circle.default>
    )
  }
}