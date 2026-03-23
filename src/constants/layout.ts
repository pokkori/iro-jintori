import { Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 20;

export const GRID_RADIUS = 3;
export const TOTAL_CELLS = 37; // radius=3 hex grid

export const HEX_SIZE = Math.floor(
  (SCREEN_WIDTH - GRID_PADDING * 2) / (3 * GRID_RADIUS + 2)
);
