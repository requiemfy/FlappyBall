import { MutableRefObject, PureComponent, Component } from 'react';
import { StyleProp, ViewStyle, ImageStyle } from 'react-native';

type AnimationConfig = {
  [name: string]: number[];
};

export interface ISpriteSheetProps {
  source: string | number | { uri: string; width: number; height: number };
  columns: number;
  rows: number;
  ref: (instance: SpriteSheet | null) => void;
  animations: AnimationConfig; // see example
  viewStyle?: StyleProp<ViewStyle>; // styles for the sprite sheet container
  imageStyle?: StyleProp<ImageStyle>; // styles for the sprite sheet
  width?: number;
  height?: number;
  frameWidth?: number;
  frameHeight?: number;
  onLoad?: () => void;
}

export class SpriteSheet extends Component<ISpriteSheetProps, {}> {
  time: any; // @remind LOL
  play: (config: {
    type: string;
    fps?: number;
    loop?: boolean;
    resetAfterFinish?: boolean;
    onFinish?: ({ finished }: { finished: boolean }) => void;
  }) => void;
  stop: (cb?: (value: number) => void) => void;
  reset: (cb?: (value: number) => void) => void;
  reverse: (config: {
    type: string;
    fps?: number;
    onFinish?: ({ finished }: { finished: boolean }) => void;
  }) => void;
}

export default SpriteSheet;