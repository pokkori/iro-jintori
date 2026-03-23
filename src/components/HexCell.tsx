import React from 'react';
import { Polygon, G } from 'react-native-svg';
import { CellState, PlayerColor } from '../types/board';

interface HexCellProps {
  cx: number;
  cy: number;
  size: number;
  cell: CellState;
  isValidPlacement: boolean;
  isPreview: boolean;
  previewColor: PlayerColor;
  onPress: () => void;
}

const CELL_COLORS = {
  empty: '#2D2D44',
  red: '#EF4444',
  blue: '#3B82F6',
  validHighlight: '#FBBF24',
  preview: { red: '#FCA5A5', blue: '#93C5FD' },
  captured: { red: '#DC2626', blue: '#2563EB' },
} as const;

function hexCorners(cx: number, cy: number, size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i;
    const angleRad = (Math.PI / 180) * angleDeg;
    const x = cx + size * Math.cos(angleRad);
    const y = cy + size * Math.sin(angleRad);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(' ');
}

function HexCellInner({
  cx, cy, size, cell,
  isValidPlacement, isPreview, previewColor,
  onPress,
}: HexCellProps) {
  let fill: string;
  let strokeWidth = 1;
  let stroke = '#3D3D5C';

  if (isPreview) {
    fill = CELL_COLORS.preview[previewColor];
    strokeWidth = 2;
    stroke = previewColor === 'red' ? '#EF4444' : '#3B82F6';
  } else if (cell.justCaptured) {
    fill = CELL_COLORS.captured[cell.owner as PlayerColor];
    strokeWidth = 2;
    stroke = '#FFD700';
  } else if (cell.justPlaced) {
    fill = CELL_COLORS[cell.owner as PlayerColor];
    strokeWidth = 2;
    stroke = '#FFFFFF';
  } else if (cell.owner !== 'empty') {
    fill = CELL_COLORS[cell.owner];
  } else if (isValidPlacement) {
    fill = CELL_COLORS.validHighlight;
  } else {
    fill = CELL_COLORS.empty;
  }

  const points = hexCorners(cx, cy, size);

  return (
    <G onPress={onPress}>
      <Polygon
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </G>
  );
}

export default React.memo(HexCellInner, (prev, next) => {
  return (
    prev.cell.owner === next.cell.owner &&
    prev.cell.justCaptured === next.cell.justCaptured &&
    prev.cell.justPlaced === next.cell.justPlaced &&
    prev.isValidPlacement === next.isValidPlacement &&
    prev.isPreview === next.isPreview &&
    prev.cx === next.cx &&
    prev.cy === next.cy &&
    prev.size === next.size
  );
});
