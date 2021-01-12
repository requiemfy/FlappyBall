import React, { createRef, MutableRefObject } from 'react';
import { Dimensions, Image, Platform } from 'react-native';
import { GameDimension } from '../utils/helpers/dimensions';
// import SpriteSheet from 'rn-sprite-sheet'; // @remind clear this soon
import SpriteSheet from '../utils/helpers/sprite-sheet';

import * as Circle from './Circle';

// type Sprite<T> = // @remind clear soon
//   (T & string & React.MutableRefObject<SpriteSheet | null>) | 
//   (T & ((instance: SpriteSheet | null) => void) & React.MutableRefObject<SpriteSheet | null>) | 
//   (T & React.RefObject<any> & React.MutableRefObject<any>);

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

      // left: 0,
      // top: 0,
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
    })
  }

  setSpriteRef = (ref: SpriteSheet | null) => {
    this.spriteRef = ref!;
    const playSprite = () => {
      if (Platform.OS === "web") // i donno why but animation loop doesn't work in web
        this.spriteRef?.play({
          type: "idle",
          fps: 12,
          loop: false,
          onFinish: () => playSprite(),
        })
      else 
        this.spriteRef?.play({
          type: "idle",
          fps: 12,
          loop: true,
        });
    }
    playSprite();
  }

  render() {

    const
      // { gameHeight } = GameDimension.window(),
      // left = gameHeight * 0.077,
      // top = gameHeight * 0.0342;

      left = this.state.left,
      top = this.state.top;

    return (
      <Circle.default {...this.props}>
        <SpriteSheet
          ref={this.setSpriteRef} // if went error, i edited SpriteSheet index.d.ts
          source={require('../../assets/bally.png')}
          columns={3}
          rows={4}
          width={this.props.size * 2.7}
          viewStyle={{

            left: -left,
            top: -top,

            // backgroundColor: "green"
          }}
          // imageStyle={{
          //   marginLeft: 
          // }}
          animations={{
            idle: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
          }}
        />
      </Circle.default>
    )
  }
}