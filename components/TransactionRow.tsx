import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { formatNaira, MoneyTransaction } from '../lib/MoneyContext';
import { categoryColors, categoryIcons, useAppTheme } from '../lib/theme';

type Props = {
  transaction: MoneyTransaction;
  index?: number;
  onPress?: () => void;
  onDelete?: () => void;
};

export function TransactionRow({ transaction, index = 0, onPress, onDelete }: Props) {
  const { colors } = useAppTheme();
  const scale = useSharedValue(1);
  const tone = categoryColors[transaction.category] || categoryColors.Other;
  const icon = (categoryIcons[transaction.category] || categoryIcons.Other) as keyof typeof Ionicons.glyphMap;
  const dateLabel = new Date(transaction.date).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
  });

  useEffect(() => {
    scale.value = withSpring(1);
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 5) * 45).duration(280)} style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onLongPress={onDelete}
        onPressIn={() => { scale.value = withSpring(0.985); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, opacity: pressed ? 0.9 : 1 }]}
        accessibilityLabel={`${transaction.category}, ${transaction.type}, ${formatNaira(transaction.amount)}`}
      >
        <View style={[styles.iconBox, { backgroundColor: `${tone}18` }]}>
          <Ionicons name={icon} size={20} color={tone} />
        </View>
        <View style={styles.details}>
          <Text numberOfLines={1} style={[styles.category, { color: colors.text }]}>{transaction.category}</Text>
          <Text numberOfLines={1} style={[styles.note, { color: colors.muted }]}>{transaction.note || 'No note'} · {dateLabel}</Text>
        </View>
        <View style={styles.amountArea}>
          <Text style={[styles.amount, { color: transaction.type === 'income' ? colors.income : colors.text }]}>
            {transaction.type === 'income' ? '+' : '−'}{formatNaira(transaction.amount)}
          </Text>
          <View style={[styles.typeDot, { backgroundColor: transaction.type === 'income' ? colors.income : colors.expense }]} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 11,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: { flex: 1, paddingHorizontal: 12 },
  category: { fontSize: 15, fontWeight: '700' },
  note: { fontSize: 12, marginTop: 4 },
  amountArea: { alignItems: 'flex-end', gap: 8 },
  amount: { fontSize: 14, fontWeight: '800' },
  typeDot: { width: 5, height: 5, borderRadius: 3 },
});
