import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { TransactionRow } from '../components/TransactionRow';
import { formatNaira, isCurrentMonth, useMoney } from '../lib/MoneyContext';
import { useAppTheme } from '../lib/theme';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function HomeScreen({ navigation }: { navigation: any }) {
  const { colors } = useAppTheme();
  const { transactions, hydrated, hideBalance, setHideBalance, openAddModal } = useMoney();
  const [refreshing, setRefreshing] = useState(false);

  const totals = useMemo(() => {
    const monthItems = transactions.filter((item) => isCurrentMonth(item.date));
    const income = monthItems.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
    const expense = monthItems.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
    const allIncome = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
    const allExpense = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
    return { income, expense, balance: allIncome - allExpense };
  }, [transactions]);

  const chart = useMemo(() => {
    const values = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      const amount = transactions
        .filter((item) => item.type === 'expense' && new Date(item.date) >= date && new Date(item.date) < end)
        .reduce((sum, item) => sum + item.amount, 0);
      return { label: date.toLocaleDateString('en-NG', { weekday: 'short' }).slice(0, 1), amount };
    });
    const max = Math.max(...values.map((item) => item.amount), 1);
    return values.map((item) => ({ ...item, height: Math.max(7, (item.amount / max) * 70) }));
  }, [transactions]);

  const sorted = useMemo(() => [...transactions].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 5), [transactions]);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 650);
  };

  if (!hydrated) {
    return <View style={[styles.loader, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <TransactionRow transaction={item} index={index} />}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} colors={[colors.primary]} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={[styles.greeting, { color: colors.muted }]}>{getGreeting()}</Text>
                <Text style={[styles.name, { color: colors.text }]}>My Money</Text>
              </View>
              <Pressable onPress={() => navigation.navigate('Settings')} style={[styles.profile, { backgroundColor: colors.primarySoft }]}>
                <Text style={[styles.profileText, { color: colors.primary }]}>MM</Text>
                <View style={[styles.online, { borderColor: colors.background }]} />
              </Pressable>
            </View>

            <View style={[styles.balanceCard, { backgroundColor: colors.primaryDark }]}>
              <View style={styles.orbOne} />
              <View style={styles.orbTwo} />
              <View style={styles.balanceTop}>
                <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
                <Pressable onPress={() => setHideBalance(!hideBalance)} hitSlop={10} accessibilityLabel={hideBalance ? 'Show balance' : 'Hide balance'}>
                  <Ionicons name={hideBalance ? 'eye-off-outline' : 'eye-outline'} size={20} color="#CBE9DA" />
                </Pressable>
              </View>
              <Text style={styles.balance}>{hideBalance ? '₦ ••••••' : formatNaira(totals.balance)}</Text>
              <View style={styles.balanceFooter}>
                <View style={styles.balanceStat}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.13)' }]}><Ionicons name="arrow-down" size={15} color="#A8E5C7" /></View>
                  <View><Text style={styles.statLabel}>Income</Text><Text style={styles.statValue}>{hideBalance ? '••••' : formatNaira(totals.income, true)}</Text></View>
                </View>
                <View style={styles.verticalLine} />
                <View style={styles.balanceStat}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.13)' }]}><Ionicons name="arrow-up" size={15} color="#FFB3A5" /></View>
                  <View><Text style={styles.statLabel}>Expenses</Text><Text style={styles.statValue}>{hideBalance ? '••••' : formatNaira(totals.expense, true)}</Text></View>
                </View>
              </View>
            </View>

            <View style={styles.quickRow}>
              <Pressable onPress={() => openAddModal('income')} style={({ pressed }) => [styles.quickButton, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}>
                <View style={[styles.quickIcon, { backgroundColor: colors.primarySoft }]}><Ionicons name="add" size={22} color={colors.income} /></View>
                <Text style={[styles.quickText, { color: colors.text }]}>Add income</Text>
              </Pressable>
              <Pressable onPress={() => openAddModal('expense')} style={({ pressed }) => [styles.quickButton, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}>
                <View style={[styles.quickIcon, { backgroundColor: '#FFE6E1' }]}><Ionicons name="remove" size={22} color={colors.expense} /></View>
                <Text style={[styles.quickText, { color: colors.text }]}>Add expense</Text>
              </Pressable>
            </View>

            <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.sectionTop}>
                <View><Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly spending</Text><Text style={[styles.sectionSub, { color: colors.muted }]}>Your last 7 days</Text></View>
                <Text style={[styles.chartTotal, { color: colors.expense }]}>{formatNaira(chart.reduce((sum, item) => sum + item.amount, 0), true)}</Text>
              </View>
              <View style={styles.bars}>
                {chart.map((item, index) => (
                  <View key={`${item.label}-${index}`} style={styles.barColumn}>
                    <View style={[styles.barTrack, { backgroundColor: colors.surfaceAlt }]}>
                      <View style={[styles.bar, { height: item.height, backgroundColor: index === chart.length - 1 ? colors.primary : '#8EC8AE' }]} />
                    </View>
                    <Text style={[styles.barLabel, { color: colors.muted }]}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.recentHeader}>
              <View><Text style={[styles.sectionTitle, { color: colors.text }]}>Recent activity</Text><Text style={[styles.sectionSub, { color: colors.muted }]}>Your latest transactions</Text></View>
              <Pressable onPress={() => navigation.navigate('Transactions')}><Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text></Pressable>
            </View>
          </>
        }
        ListEmptyComponent={<EmptyState title="No transactions yet" message="Add your first income or expense to see your money story." actionLabel="Add transaction" onAction={() => openAddModal('expense')} />}
        ListFooterComponent={<View style={styles.bottomSpace} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 20 },
  greeting: { fontSize: 13, fontWeight: '500' },
  name: { fontSize: 25, fontWeight: '900', letterSpacing: -0.6, marginTop: 2 },
  profile: { width: 45, height: 45, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  profileText: { fontSize: 13, fontWeight: '900' },
  online: { position: 'absolute', right: -1, bottom: 1, width: 12, height: 12, borderRadius: 6, backgroundColor: '#42C27B', borderWidth: 2 },
  balanceCard: { minHeight: 215, borderRadius: 28, padding: 22, overflow: 'hidden', shadowColor: '#0C5537', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.22, shadowRadius: 18, elevation: 8 },
  orbOne: { position: 'absolute', width: 170, height: 170, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.05)', right: -55, top: -75 },
  orbTwo: { position: 'absolute', width: 100, height: 100, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.04)', left: -45, bottom: -38 },
  balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { color: '#B8DCCB', fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  balance: { color: '#FFFFFF', fontSize: 34, fontWeight: '900', letterSpacing: -1.2, marginTop: 14 },
  balanceFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 'auto' },
  balanceStat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9 },
  statIcon: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  statLabel: { color: '#ACCEBE', fontSize: 11 },
  statValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', marginTop: 2 },
  verticalLine: { width: 1, height: 34, backgroundColor: 'rgba(255,255,255,0.13)', marginHorizontal: 14 },
  quickRow: { flexDirection: 'row', gap: 11, marginTop: 16 },
  quickButton: { flex: 1, height: 60, borderRadius: 18, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 9 },
  quickIcon: { width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quickText: { fontSize: 13, fontWeight: '800' },
  chartCard: { borderWidth: 1, borderRadius: 22, padding: 18, marginTop: 22 },
  sectionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sectionTitle: { fontSize: 17, fontWeight: '900', letterSpacing: -0.2 },
  sectionSub: { fontSize: 12, marginTop: 4 },
  chartTotal: { fontSize: 15, fontWeight: '900' },
  bars: { height: 100, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16 },
  barColumn: { flex: 1, alignItems: 'center' },
  barTrack: { width: 13, height: 76, borderRadius: 7, justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: 13, borderRadius: 7 },
  barLabel: { fontSize: 10, fontWeight: '700', marginTop: 6 },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 26, marginBottom: 5 },
  seeAll: { fontSize: 13, fontWeight: '800', paddingBottom: 1 },
  bottomSpace: { height: 28 },
});
