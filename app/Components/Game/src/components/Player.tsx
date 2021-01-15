import React, { createRef, MutableRefObject } from 'react';
import { Dimensions, Image, Platform } from 'react-native';
import { GameDimension } from '../utils/helpers/dimensions';
// import SpriteSheet from 'rn-sprite-sheet'; // @remind clear this soon
import SpriteSheet from '../utils/helpers/sprite-sheet';

import * as Circle from './Circle';

interface State {
  left: number;
  top: number;
}

export default class Player extends React.Component<Circle.Props, State> {
  spriteRef!: SpriteSheet;

  constructor(props: Circle.Props) {
    super(props);
    const { gameHeight } = GameDimension.window();
    this.state = {
      left: gameHeight * 0.077,
      top: gameHeight * 0.0342,
    }
  }

  componentDidMount() {
    console.log("PLAYER DID MOUNT");
    Dimensions.addEventListener('change', this.orientationCallback); // luckily this will not invoke in eg. landscape left to landscape right
  }

  componentWillUnmount() {
    console.log("PLAYER WILL UN-MOUNT")
    Dimensions.removeEventListener('change', this.orientationCallback);
  }

  orientationCallback = () => {
    console.log("PLAYER ORIENT")
    const { gameHeight } = GameDimension.window();
    this.setState({
      left: gameHeight * 0.077,
      top: gameHeight * 0.0342,
    });
    this.normalPlay();
  }

  normalPlay = () => { // usually for mobile, also triggered again in orientation change
    this.spriteRef?.play({
      type: "idle",
      fps: 12,
      loop: true,
    });
  }

  setSpriteRef = (ref: SpriteSheet | null) => {
    this.spriteRef = ref!;
    const playSprite = () => {
      if (Platform.OS === "web") // i donno why but animation loop doesn't work in web, therefore just do it recursively
        this.spriteRef?.play({
          type: "idle",
          fps: 12,
          loop: false,
          onFinish: () => playSprite(),
        })
      else this.normalPlay();
    }
    playSprite();
  }

  render() {
    const
      left = this.state.left,
      top = this.state.top;
    return (
      <Circle.default {...this.props}>
        <SpriteSheet
          ref={this.setSpriteRef} // if went error, i edited SpriteSheet index.d.ts
          source={require('../../assets/bally.png')}
          columns={8}
          rows={8}
          width={this.props.size * 2.7}
          viewStyle={{
            left: -left,
            top: -top,
          }}
          animations={{
            idle: [0, 1, 2, 3, 4, 5, 6, 7, 8]
          }} />
      </Circle.default>
    )
  }
}