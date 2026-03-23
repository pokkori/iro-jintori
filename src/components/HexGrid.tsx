import React from 'react';
import { View } from 'react-native';
import Svg from 'react-native-svg';
import { BoardState, PlayerColor } from '../types/board';
import { HexCoord } from '../types/hex';
import HexCell from './HexCell';

interface HexGridProps {
  board: BoardState;
  validPlacements: Set<string>;
  previewCells: HexCoord[] | null;
  onCellPress: (coord: HexCoord) => void;
  currentPlayer: PlayerColor;
  hexSize: number;
}

function axialToSvgPixel(
  q: number, r: number, size: number, centerX: number, centerY: number,
): { x: number; y: number } {
  const x = centerX + size * (3 / 2 * q);
  const y = centerY + size * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
  return { x, y };
}

export default function HexGrid({
  board, validPlacements, previewCells, onCellPress, currentPlayer, hexSize,
}: HexGridProps) {
  const size = hexSize;
  const vbWidth = size * (3 * board.radius + 2) * 2;
  const vbHeight = size * Math.sqrt(3) * (2 * board.radius + 1) * 1.1;
  const cx = vbWidth / 2;
  const cy = vbHeight / 2;

  const cells: React.JSX.Element[] = [];

  for (const [key, cell] of board.cells) {
    const { x, y } = axialToSvgPixel(cell.coord.q, cell.coord.r, size, cx, cy);
    const isValid = validPlacements.has(key);
    const isPreview = previewCells?.some(
      p => p.q === cell.coord.q && p.r === cell.coord.r
    ) ?? false;

    cells.push(
      <HexCell
        key={key}
        cx={x}
        cy={y}
        size={size * 0.95}
        cell={cell}
        isValidPlacement={isValid}
        isPreview={isPreview}
        previewColor={currentPlayer}
        onPress={() => onCellPress(cell.coord)}
      />
    );
  }

  return (
    <View style={{ width: '100%', aspectRatio: vbWidth / vbHeight }}>
      <Svg viewBox={`0 0 ${vbWidth} ${vbHeight}`} width="100%" height="100%">
        {cells}
      </Svg>
    </View>
  );
}
