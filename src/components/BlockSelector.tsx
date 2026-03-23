import React from 'react';
import { View, TouchableOpacity, Text, ScrollView, StyleSheet } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { BlockId, BlockShape } from '../types/block';
import { getBlockById } from '../constants/blocks';
import { COLORS } from '../constants/colors';

interface BlockSelectorProps {
  blockIds: BlockId[];
  selectedBlockId: BlockId | null;
  onSelect: (id: BlockId) => void;
}

function hexCornersMini(cx: number, cy: number, size: number): string {
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

function MiniBlockPreview({ block, selected }: { block: BlockShape; selected: boolean }) {
  const miniSize = 8;
  const svgSize = 70;
  const center = svgSize / 2;

  return (
    <View style={[styles.blockCard, selected && styles.blockCardSelected]}>
      <Svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        {block.cells.map((cell, i) => {
          const x = center + miniSize * (3 / 2 * cell.q);
          const y = center + miniSize * (Math.sqrt(3) / 2 * cell.q + Math.sqrt(3) * cell.r);
          return (
            <Polygon
              key={i}
              points={hexCornersMini(x, y, miniSize * 0.9)}
              fill={selected ? block.color : '#555'}
              stroke={selected ? '#FFF' : '#777'}
              strokeWidth={1}
            />
          );
        })}
      </Svg>
      <Text style={styles.blockName}>{block.name}</Text>
    </View>
  );
}

export default function BlockSelector({ blockIds, selectedBlockId, onSelect }: BlockSelectorProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {blockIds.map(id => {
        const block = getBlockById(id);
        if (!block) return null;
        return (
          <TouchableOpacity
            key={id}
            onPress={() => onSelect(id)}
            activeOpacity={0.7}
          >
            <MiniBlockPreview block={block} selected={selectedBlockId === id} />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  blockCard: {
    alignItems: 'center',
    marginHorizontal: 4,
    padding: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  blockCardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.surfaceLight,
  },
  blockName: {
    color: COLORS.text,
    fontSize: 10,
    marginTop: 2,
  },
});
