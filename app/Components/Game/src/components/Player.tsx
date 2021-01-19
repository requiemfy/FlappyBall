import React, { createRef, MutableRefObject } from 'react';
import { Dimensions, Image, Platform } from 'react-native';
import { GameDimension } from '../utils/helpers/dimensions';
import SpriteSheet from '../utils/helpers/sprite-sheet';
import * as Circle from './Circle';

interface Props { setRef: ((ref: any) => void) | null; }

interface State {
  left: number;
  top: number;
  finish: boolean; // for the purpose of forcely stop the onFinish callBack ASAP and never continues when FALSE, smoothly continue to next animation when TRUE
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
      finish: true,
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
    this.props.setRef ? this.props.setRef(null) : null; // setting game.playerRef to null
    this.spriteRef = null;
  }

  orientationCallback = () => {
    console.log("PLAYER ORIENT")
    const { gameHeight } = GameDimension.window();
    this.setState({
      left: gameHeight * 0.077,
      top: gameHeight * 0.0342,
    });
  }

  newSprite = (spriteRef: SpriteSheet | null) => {
    this.spriteRef = spriteRef!;
    this.setState({ finish: true });
  }

  stopCurrentAnim = () => {
    this.setState({ finish: false }); // stop animation ASAP please, and don't ever try to continue no matter what
    this.spriteRef!.stop();
  }

  playSprite = (type: string, fps: number, loop: boolean, cb = () => {}) => {
    this.spriteRef?.play({
      type: type,
      fps: fps,
      loop: loop,
      onFinish: () => this.state.finish ? cb() : null
    })
  }

  idle = (spriteRef: SpriteSheet | null) => {
    this.spriteRef = spriteRef!;
    this.playSprite("idle", 12, true);
  }
  // optional animation, not really used for now
  fly = (spriteRef: SpriteSheet | null) => {
    this.newSprite(spriteRef);
    this.playSprite(
      "fly", 25, false,
      () => this.playSprite("flyIdle", 12, true)
    );
  }
  // optional animation
  fall = (spriteRef: SpriteSheet | null) => {
    this.newSprite(spriteRef);
    this.playSprite(
      "flyReverse", 60, false, 
      () => this.playSprite(
        "fall", 15, false, 
        () => this.playSprite("fallIdle", 12, true)
      )
    );
  }

  reverse = (spriteRef: SpriteSheet | null, type: string, fps: number, cb = () => {}) => {
    this.newSprite(spriteRef);
    this.spriteRef?.reverse({
      type: type,
      fps: fps,
      onFinish: () => this.state.finish ? cb() : null
    });
  }

  reverseFlyThenFall = (spriteRef: SpriteSheet | null) => {
    this.reverse(
      spriteRef, "fly", 200,
      () =>
        this.state.finish 
          ? this.playSprite(
              "fall", 15, false,
              () => this.playSprite("fallIdle", 12, true)
            )
          : null
    );
  }

  reverseFallThenFly = (spriteRef: SpriteSheet | null) => {
    this.reverse(
      spriteRef, "fall", 200,
      () => 
        this.state.finish 
          ? this.playSprite(
              "fly", 25, false,
              () => this.playSprite("flyIdle", 12, true)
            )
          : null
    );
  }

  collided = (spriteRef: SpriteSheet | null) => {
    this.spriteRef = spriteRef!;
    this.playSprite("collided", 12, false);
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
            ]
          }} />
      </Circle.default>
    )
  }
}