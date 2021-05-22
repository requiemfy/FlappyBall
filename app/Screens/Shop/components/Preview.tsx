import React from 'react';
import { autoImageDim } from '../../../src/helpers';
import SpriteSheet from '../../Game/src/utils/helpers/sprite-sheet';

export default function Preview(props: any) {
  let spriteRef: SpriteSheet | null = null;

  const setRef = (_ref: SpriteSheet | null) => {
    spriteRef = _ref!;
    playSprite("idle", 12, true);
  }

  const playSprite = (type: string, fps: number, loop: boolean, cb = ({ finished }: { finished: boolean }) => {}) => {
    spriteRef?.play({
      type: type,
      fps: fps,
      loop: loop,
      onFinish: cb
    })
  }

  const { width, height } = autoImageDim(2700, 3000);
  
  return (
    <SpriteSheet
      ref={setRef} // if went error, i edited SpriteSheet index.d.ts
      source={{ uri: props.url, width: width, height: height }}
      columns={9}
      rows={10}
      width={200}
      animations={{ idle: [0, 1, 2, 3, 4, 5, 6, 7, 8] }} 
      viewStyle={{
        marginLeft: -100
      }}/>
  )

}