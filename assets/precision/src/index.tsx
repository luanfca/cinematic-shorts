import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Film} from './Film';
import c from '../episode.json';
const Root=()=> <Composition id={c.id} component={Film} durationInFrames={Math.round(c.seconds*c.fps)} fps={c.fps} width={c.width} height={c.height}/>;
registerRoot(Root);
