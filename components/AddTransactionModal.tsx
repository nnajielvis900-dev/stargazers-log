import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionType, useMoney } from '../lib/MoneyContext';
import { categoryIcons, useAppTheme } from '../lib/theme';

const expenseCategories = ['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Other'];
const incomeCategories = ['Salary', 'Freelance', 'Gift', 'Other'];

export function AddTransactionModal() {
  const { colors, isDark } = useAppTheme();
  const { modalVisible, modalType, closeAddModal, addTransaction } = useMoney();
  const [type, setType] = useState<TransactionType>(modalType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');

  const categories = useMemo(() => (type === 'income' ? incomeCategories : expenseCategories), [type]);

  useEffect(() => {
    if (!modalVisible) return;
    setType(modalType);
    setCategory(modalType === 'income' ? 'Salary' : 'Food');
    setAmount('');
    setNote('');
  }, [modalVisible, modalType]);

  const changeType = (nextType: TransactionType) => {
    setType(nextType);
    setCategory(nextType === 'income' ? 'Salary' : 'Food');
  };

  const save = () => {
    const numericAmount = Number(amount.replace(/,/g, ''));
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert('Enter an amount', 'Please enter a valid amount greater than zero.');
      return;
    }
    addTransaction({ type, amount: numericAmount, category, note: note.trim() || category });
    closeAddModal();
  };

  return (
    <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeAddModal}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Pressable accessibilityLabel="Close" onPress={closeAddModal} style={[styles.roundButton, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Add transaction</Text>
            <Pressable onPress={save} hitSlop={8}><Text style={[styles.saveText, { color: colors.primary }]}>Save</Text></Pressable>
          </View>

          <View style={styles.content}>
            <View style={[styles.segment, { backgroundColor: colors.surfaceAlt }]}>
              {(['expense', 'income'] as TransactionType[]).map((item) => (
                <Pressable
                  key={item}
                  onPress={() => changeType(item)}
                  style={[styles.segmentItem, type === item && { backgroundColor: colors.surface }]}
                >
                  <Ionicons
                    name={item === 'expense' ? 'arrow-up' : 'arrow-down'}
                    size={16}
                    color={type === item ? (item === 'income' ? colors.income : colors.expense) : colors.muted}
                  />
                  <Text style={[styles.segmentText, { color: type === item ? colors.text : colors.muted }]}>
                    {item === 'expense' ? 'Expense' : 'Income'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.muted }]}>AMOUNT</Text>
            <View style={styles.amountRow}>
              <Text style={[styles.naira, { color: colors.text }]}>₦</Text>
              <TextInput
                value={amount}
                onChangeText={(value) => setAmount(value.replace(/[^0-9.]/g, ''))}
                placeholder="0"
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
                returnKeyType="next"
                autoFocus
                selectionColor={colors.primary}
                style={[styles.amountInput, { color: colors.text }]}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Text style={[styles.label, { color: colors.muted, marginTop: 28 }]}>CATEGORY</Text>
            <FlatList
              horizontal
              data={categories}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => {
                const selected = item === category;
                return (
                  <Pressable
                    onPress={() => setCategory(item)}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: selected ? colors.primary : colors.surface, borderColor: selected ? colors.primary : colors.border },
                    ]}
                  >
                    <Ionicons name={(categoryIcons[item] || 'ellipse-outline') as keyof typeof Ionicons.glyphMap} size={17} color={selected ? colors.white : colors.muted} />
                    <Text style={[styles.categoryText, { color: selected ? colors.white : colors.text }]}>{item}</Text>
                  </Pressable>
                );
              }}
            />

            <Text style={[styles.label, { color: colors.muted, marginTop: 26 }]}>NOTE</Text>
            <View style={[styles.noteField, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="create-outline" size={20} color={colors.muted} />
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={type === 'income' ? 'e.g. March salary' : 'e.g. Weekly groceries'}
                placeholderTextColor={colors.muted}
                returnKeyType="done"
                onSubmitEditing={save}
                style={[styles.noteInput, { color: colors.text }]}
                maxLength={60}
              />
            </View>

            <View style={[styles.dateCard, { backgroundColor: colors.primarySoft }]}>
              <View style={[styles.dateIcon, { backgroundColor: colors.surface }]}>
                <Ionicons name="calendar-outline" size={19} color={colors.primary} />
              </View>
              <View style={styles.flex}>
                <Text style={[styles.dateTitle, { color: colors.text }]}>Today</Text>
                <Text style={[styles.dateText, { color: colors.muted }]}>
                  {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
            </View>
          </View>

          <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
            <Pressable onPress={save} style={({ pressed }) => [styles.submit, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}>
              <Text style={styles.submitText}>Add {type}</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: { height: 64, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  roundButton: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  saveText: { fontSize: 15, fontWeight: '800' },
  content: { flex: 1, paddingHorizontal: 22, paddingTop: 24 },
  segment: { flexDirection: 'row', padding: 4, borderRadius: 16 },
  segmentItem: { flex: 1, height: 44, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  segmentText: { fontSize: 14, fontWeight: '800', textTransform: 'capitalize' },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: 24 },
  amountRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  naira: { fontSize: 34, fontWeight: '500', marginRight: 7 },
  amountInput: { flex: 1, fontSize: 48, fontWeight: '800', paddingVertical: 4 },
  divider: { height: 1 },
  categoryList: { gap: 9, paddingVertical: 12, paddingRight: 20 },
  categoryChip: { height: 44, borderRadius: 15, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 7 },
  categoryText: { fontSize: 13, fontWeight: '700' },
  noteField: { height: 54, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginTop: 11 },
  noteInput: { flex: 1, fontSize: 15, marginLeft: 10 },
  dateCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 17, marginTop: 22, gap: 12 },
  dateIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  dateTitle: { fontSize: 14, fontWeight: '800' },
  dateText: { fontSize: 12, marginTop: 3 },
  footer: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: Platform.OS === 'ios' ? 4 : 16, borderTopWidth: StyleSheet.hairlineWidth },
  submit: { height: 56, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', textTransform: 'capitalize' },
});
