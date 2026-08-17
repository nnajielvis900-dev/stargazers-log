import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Budget, formatNaira, isCurrentMonth, useMoney } from '../lib/MoneyContext';
import { categoryColors, categoryIcons, useAppTheme } from '../lib/theme';

export function BudgetScreen() {
  const { colors } = useAppTheme();
  const { budgets, transactions, updateBudget } = useMoney();
  const [editing, setEditing] = useState<Budget | null>(null);
  const [limit, setLimit] = useState('');

  const spending = useMemo(() => {
    const result: Record<string, number> = {};
    transactions.filter((item) => item.type === 'expense' && isCurrentMonth(item.date)).forEach((item) => {
      result[item.category] = (result[item.category] || 0) + item.amount;
    });
    return result;
  }, [transactions]);

  const totalLimit = budgets.reduce((sum, item) => sum + item.limit, 0);
  const totalSpent = budgets.reduce((sum, item) => sum + (spending[item.category] || 0), 0);
  const totalProgress = Math.min(totalSpent / Math.max(totalLimit, 1), 1);

  const startEdit = (item: Budget) => {
    setEditing(item);
    setLimit(String(item.limit));
  };

  const saveLimit = () => {
    const amount = Number(limit.replace(/,/g, ''));
    if (!editing || !Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Invalid budget', 'Enter a budget amount greater than zero.');
      return;
    }
    updateBudget(editing.category, amount);
    setEditing(null);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.category}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const spent = spending[item.category] || 0;
          const progress = spent / Math.max(item.limit, 1);
          const tone = progress >= 1 ? colors.expense : progress >= 0.75 ? colors.warning : categoryColors[item.category];
          return (
            <Pressable onPress={() => startEdit(item)} style={({ pressed }) => [styles.budgetRow, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 }]}>
              <View style={[styles.categoryIcon, { backgroundColor: `${categoryColors[item.category]}18` }]}>
                <Ionicons name={(categoryIcons[item.category] || 'ellipse-outline') as keyof typeof Ionicons.glyphMap} size={21} color={categoryColors[item.category]} />
              </View>
              <View style={styles.budgetInfo}>
                <View style={styles.budgetTop}>
                  <Text style={[styles.categoryName, { color: colors.text }]}>{item.category}</Text>
                  <Text style={[styles.budgetAmount, { color: colors.text }]}>{formatNaira(spent, true)} <Text style={{ color: colors.muted, fontWeight: '500' }}>/ {formatNaira(item.limit, true)}</Text></Text>
                </View>
                <View style={[styles.track, { backgroundColor: colors.surfaceAlt }]}><View style={[styles.fill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: tone }]} /></View>
                <Text style={[styles.remaining, { color: progress >= 1 ? colors.expense : colors.muted }]}>
                  {progress >= 1 ? `${formatNaira(spent - item.limit)} over budget` : `${formatNaira(item.limit - spent)} left`}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          );
        }}
        ListHeaderComponent={
          <>
            <View style={styles.header}><Text style={[styles.title, { color: colors.text }]}>Monthly budget</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Spend with intention</Text></View>
            <View style={[styles.overview, { backgroundColor: colors.primaryDark }]}>
              <View style={styles.overviewTop}><Text style={styles.overviewLabel}>MARCH BUDGET</Text><View style={styles.calendar}><Ionicons name="calendar-outline" size={17} color="#D5EFE2" /></View></View>
              <Text style={styles.overviewValue}>{formatNaira(Math.max(totalLimit - totalSpent, 0))}</Text>
              <Text style={styles.overviewSub}>remaining of {formatNaira(totalLimit)}</Text>
              <View style={styles.bigTrack}><View style={[styles.bigFill, { width: `${totalProgress * 100}%` }]} /></View>
              <View style={styles.trackLabels}><Text style={styles.trackText}>{Math.round(totalProgress * 100)}% used</Text><Text style={styles.trackText}>{formatNaira(totalSpent)} spent</Text></View>
            </View>
            <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text><Text style={[styles.tapHint, { color: colors.muted }]}>Tap to edit</Text></View>
          </>
        }
        ListFooterComponent={
          <View style={[styles.tip, { backgroundColor: colors.primarySoft }]}>
            <View style={[styles.tipIcon, { backgroundColor: colors.surface }]}><Ionicons name="bulb-outline" size={20} color={colors.primary} /></View>
            <View style={styles.budgetInfo}><Text style={[styles.tipTitle, { color: colors.text }]}>A simple money rule</Text><Text style={[styles.tipText, { color: colors.muted }]}>Try keeping needs below 50% and wants below 30% of your income.</Text></View>
          </View>
        }
      />

      <Modal visible={Boolean(editing)} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setEditing(null)} />
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <View><Text style={[styles.modalTitle, { color: colors.text }]}>Edit {editing?.category} budget</Text><Text style={[styles.modalSub, { color: colors.muted }]}>Set your monthly spending limit</Text></View>
              <Pressable onPress={() => setEditing(null)} style={[styles.closeButton, { backgroundColor: colors.surfaceAlt }]}><Ionicons name="close" size={20} color={colors.text} /></Pressable>
            </View>
            <Text style={[styles.inputLabel, { color: colors.muted }]}>MONTHLY LIMIT</Text>
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <Text style={[styles.inputNaira, { color: colors.text }]}>₦</Text>
              <TextInput value={limit} onChangeText={(value) => setLimit(value.replace(/[^0-9]/g, ''))} keyboardType="number-pad" autoFocus returnKeyType="done" onSubmitEditing={saveLimit} style={[styles.input, { color: colors.text }]} />
            </View>
            <Pressable onPress={saveLimit} style={({ pressed }) => [styles.saveButton, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}><Text style={styles.saveText}>Save budget</Text></Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { paddingHorizontal: 20, paddingBottom: 30 },
  header: { paddingTop: 14, marginBottom: 22 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.8 },
  subtitle: { fontSize: 13, marginTop: 3 },
  overview: { borderRadius: 26, padding: 21, minHeight: 212, overflow: 'hidden' },
  overviewTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  overviewLabel: { color: '#B8DCCB', fontSize: 11, letterSpacing: 1.2, fontWeight: '800' },
  calendar: { width: 34, height: 34, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  overviewValue: { color: '#FFFFFF', fontSize: 32, fontWeight: '900', letterSpacing: -1, marginTop: 14 },
  overviewSub: { color: '#AED0C0', fontSize: 12, marginTop: 4 },
  bigTrack: { height: 8, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.13)', marginTop: 25, overflow: 'hidden' },
  bigFill: { height: 8, borderRadius: 5, backgroundColor: '#70D3A5' },
  trackLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 },
  trackText: { color: '#C9E3D6', fontSize: 11, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 26, marginBottom: 11 },
  sectionTitle: { fontSize: 18, fontWeight: '900' },
  tapHint: { fontSize: 11 },
  budgetRow: { borderWidth: 1, borderRadius: 19, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  categoryIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  budgetInfo: { flex: 1, marginHorizontal: 12 },
  budgetTop: { flexDirection: 'row', justifyContent: 'space-between' },
  categoryName: { fontSize: 14, fontWeight: '800' },
  budgetAmount: { fontSize: 12, fontWeight: '800' },
  track: { height: 5, borderRadius: 4, overflow: 'hidden', marginTop: 10 },
  fill: { height: 5, borderRadius: 4 },
  remaining: { fontSize: 10, marginTop: 6 },
  tip: { flexDirection: 'row', alignItems: 'flex-start', padding: 15, borderRadius: 19, marginTop: 12 },
  tipIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  tipTitle: { fontSize: 13, fontWeight: '800' },
  tipText: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: Platform.OS === 'ios' ? 38 : 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modalTitle: { fontSize: 19, fontWeight: '900' },
  modalSub: { fontSize: 12, marginTop: 4 },
  closeButton: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  inputLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginTop: 25 },
  inputWrap: { height: 58, borderRadius: 17, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginTop: 9 },
  inputNaira: { fontSize: 22, fontWeight: '800' },
  input: { flex: 1, fontSize: 22, fontWeight: '800', marginLeft: 8 },
  saveButton: { height: 54, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  saveText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
