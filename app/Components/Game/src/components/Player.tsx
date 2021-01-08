import React, { createRef, MutableRefObject } from 'react';
import { Image, Platform } from 'react-native';
// import SpriteSheet from 'rn-sprite-sheet'; // @remind clear this soon
import SpriteSheet from '../utils/helpers/sprite-sheet';

import * as Circle from './Circle';

// type Sprite<T> = // @remind clear soon
//   (T & string & React.MutableRefObject<SpriteSheet | null>) | 
//   (T & ((instance: SpriteSheet | null) => void) & React.MutableRefObject<SpriteSheet | null>) | 
//   (T & React.RefObject<any> & React.MutableRefObject<any>);

export default class Player extends React.Component<Circle.Props, {}> {
  spriteRef!: SpriteSheet;

  constructor(props: Circle.Props) {
    super(props);
  }

  componentDidMount() {
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
      size = this.props.size * 2.6;
    return (
      <Circle.default {...this.props}>
        <SpriteSheet
          ref={this.setSpriteRef} // if went error, i edited SpriteSheet index.d.ts
          source={require('../../assets/bally.png')}
          columns={3}
          rows={4}
          width={size}
          viewStyle={{
            // left: -56,
            // top: -24
            // backgroundColor: "green"
          }}
          animations={{
            idle: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
          }}
        />
      </Circle.default>
    )
  }
}