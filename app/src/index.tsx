import * as React from 'react';
import MainStackScreen from '../Navigation/src';
import * as Firebase from './firebase';

Firebase.init();

export default function Game() {
  return (
    <MainStackScreen />
  );
}