import { number } from 'prop-types';
import React, { createRef, MutableRefObject } from 'react';
import { Animated, Easing, Dimensions, Image, Platform, TouchableWithoutFeedback } from 'react-native';
import { GameDimension } from '../utils/helpers/dimensions';
import { BODY, SCREEN_HEIGHT } from '../utils/world/constants';
import * as Box from './shapes/Box';

interface Props { setRef: ((ref: any) => void) | null; }

interface State {
}

export default class Wall extends React.Component<Box.Props & Props, State> {
  moving!: NodeJS.Timeout;

  componentDidMount() {
    this.move();
  }

  componentWillUnmount() {
    clearInterval(this.moving);
  }

  move = () => {
    this.moving = setInterval(() => {
      BODY.translate( this.props.body, { x: -3, y: 0 } );
      this.setState({});
    }, 10);
  }
  
  render() {

    return(
      <Box.default {...this.props}>
      </Box.default>
    )
  }
}