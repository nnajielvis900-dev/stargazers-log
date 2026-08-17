import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatNaira, useMoney } from '../lib/MoneyContext';
import { useAppTheme } from '../lib/theme';

type SettingItem = {
  key: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: string;
};

const items: SettingItem[] = [
  { key: 'currency', title: 'Currency', subtitle: 'Nigerian Naira (₦)', icon: 'cash-outline', tone: '#167A52' },
  { key: 'privacy', title: 'Privacy', subtitle: 'Keep your balance discreet', icon: 'eye-off-outline', tone: '#9A62D6' },
  { key: 'storage', title: 'Local storage', subtitle: 'Your entries stay on this device', icon: 'phone-portrait-outline', tone: '#3478C9' },
];

export function SettingsScreen() {
  const { colors, isDark } = useAppTheme();
  const { hideBalance, setHideBalance, monthlyGoal, setMonthlyGoal, clearTransactions, restoreDemoData } = useMoney();
  const [goal, setGoal] = useState(String(monthlyGoal));

  const saveGoal = () => {
    const amount = Number(goal.replace(/,/g, ''));
    if (!Number.isFinite(amount) || amount < 0) {
      Alert.alert('Invalid goal', 'Enter a valid savings goal.');
      return;
    }
    setMonthlyGoal(amount);
    Alert.alert('Goal updated', `Your monthly savings goal is now ${formatNaira(amount)}.`);
  };

  const clearAll = () => {
    Alert.alert('Clear all transactions?', 'Your transaction history will be permanently removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear all', style: 'destructive', onPress: clearTransactions },
    ]);
  };

  const restore = () => {
    Alert.alert('Restore sample data?', 'This replaces your current entries with sample transactions and budgets.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Restore', onPress: restoreDemoData },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.settingIcon, { backgroundColor: `${item.tone}18` }]}><Ionicons name={item.icon} size={20} color={item.tone} /></View>
            <View style={styles.settingInfo}><Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text><Text style={[styles.settingSub, { color: colors.muted }]}>{item.subtitle}</Text></View>
            {item.key === 'privacy' ? (
              <Switch value={hideBalance} onValueChange={setHideBalance} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#FFFFFF" />
            ) : <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
          </View>
        )}
        ListHeaderComponent={
          <>
            <View style={styles.header}><Text style={[styles.title, { color: colors.text }]}>Settings</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Make MAFIXXMONEY yours</Text></View>
            <View style={[styles.brandCard, { backgroundColor: colors.primaryDark }]}>
              <View style={styles.logo}><Text style={styles.logoText}>M</Text></View>
              <View style={styles.brandInfo}><Text style={styles.brand}>MAFIXXMONEY</Text><Text style={styles.tagline}>Fix your money. Build your future.</Text></View>
              <View style={styles.verified}><Ionicons name="checkmark" size={13} color={colors.primaryDark} /></View>
            </View>
            <Text style={[styles.sectionLabel, { color: colors.muted }]}>PREFERENCES</Text>
          </>
        }
        ListFooterComponent={
          <>
            <Text style={[styles.sectionLabel, { color: colors.muted }]}>MONTHLY SAVINGS GOAL</Text>
            <View style={[styles.goalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.goalHead}><View style={[styles.goalIcon, { backgroundColor: colors.primarySoft }]}><Ionicons name="flag-outline" size={20} color={colors.primary} /></View><View style={styles.settingInfo}><Text style={[styles.settingTitle, { color: colors.text }]}>Savings target</Text><Text style={[styles.settingSub, { color: colors.muted }]}>An amount to aim for each month</Text></View></View>
              <View style={[styles.goalInputWrap, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.naira, { color: colors.text }]}>₦</Text>
                <TextInput value={goal} onChangeText={(value) => setGoal(value.replace(/[^0-9]/g, ''))} keyboardType="number-pad" returnKeyType="done" onSubmitEditing={saveGoal} style={[styles.goalInput, { color: colors.text }]} />
                <Pressable onPress={saveGoal} style={[styles.goalSave, { backgroundColor: colors.primary }]}><Text style={styles.goalSaveText}>Save</Text></Pressable>
              </View>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.muted }]}>DATA</Text>
            <View style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Pressable onPress={restore} style={[styles.actionRow, { borderBottomColor: colors.border }]}><Ionicons name="refresh-outline" size={21} color={colors.primary} /><Text style={[styles.actionText, { color: colors.text }]}>Restore sample data</Text><Ionicons name="chevron-forward" size={18} color={colors.muted} /></Pressable>
              <Pressable onPress={clearAll} style={styles.actionRow}><Ionicons name="trash-outline" size={21} color={colors.expense} /><Text style={[styles.actionText, { color: colors.expense }]}>Clear all transactions</Text><Ionicons name="chevron-forward" size={18} color={colors.muted} /></Pressable>
            </View>
            <View style={styles.appearance}><Ionicons name={isDark ? 'moon' : 'sunny'} size={15} color={colors.muted} /><Text style={[styles.appearanceText, { color: colors.muted }]}>Following your device’s {isDark ? 'dark' : 'light'} appearance</Text></View>
            <Text style={[styles.version, { color: colors.muted }]}>MAFIXXMONEY · Version 1.0</Text>
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 28 },
  header: { paddingTop: 14, marginBottom: 22 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.8 },
  subtitle: { fontSize: 13, marginTop: 3 },
  brandCard: { borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center' },
  logo: { width: 54, height: 54, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#0C5537', fontSize: 26, fontWeight: '900' },
  brandInfo: { flex: 1, marginLeft: 14 },
  brand: { color: '#FFFFFF', fontSize: 17, fontWeight: '900', letterSpacing: 0.4 },
  tagline: { color: '#B8DCCB', fontSize: 11, marginTop: 4 },
  verified: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#8FE0B8', alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginTop: 26, marginBottom: 9, marginLeft: 3 },
  settingRow: { minHeight: 70, borderWidth: 1, borderRadius: 18, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, marginBottom: 9 },
  settingIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  settingInfo: { flex: 1, marginLeft: 12 },
  settingTitle: { fontSize: 14, fontWeight: '800' },
  settingSub: { fontSize: 11, marginTop: 3 },
  goalCard: { borderRadius: 20, borderWidth: 1, padding: 15 },
  goalHead: { flexDirection: 'row', alignItems: 'center' },
  goalIcon: { width: 41, height: 41, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  goalInputWrap: { borderWidth: 1, height: 52, borderRadius: 15, flexDirection: 'row', alignItems: 'center', paddingLeft: 14, marginTop: 15 },
  naira: { fontSize: 17, fontWeight: '800' },
  goalInput: { flex: 1, paddingHorizontal: 7, fontSize: 17, fontWeight: '800' },
  goalSave: { alignSelf: 'stretch', paddingHorizontal: 17, borderTopRightRadius: 14, borderBottomRightRadius: 14, alignItems: 'center', justifyContent: 'center' },
  goalSaveText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  actionCard: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 15 },
  actionRow: { minHeight: 57, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: StyleSheet.hairlineWidth },
  actionText: { flex: 1, fontSize: 13, fontWeight: '700' },
  appearance: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24 },
  appearanceText: { fontSize: 11 },
  version: { textAlign: 'center', fontSize: 10, marginTop: 12 },
});
