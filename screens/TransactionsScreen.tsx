import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { TransactionRow } from '../components/TransactionRow';
import { formatNaira, TransactionType, useMoney } from '../lib/MoneyContext';
import { useAppTheme } from '../lib/theme';

type Filter = 'all' | TransactionType;

export function TransactionsScreen() {
  const { colors } = useAppTheme();
  const { transactions, deleteTransaction, openAddModal } = useMoney();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...transactions]
      .filter((item) => filter === 'all' || item.type === filter)
      .filter((item) => !normalized || `${item.category} ${item.note}`.toLowerCase().includes(normalized))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [transactions, filter, query]);

  const total = filtered.reduce((sum, item) => sum + (item.type === 'income' ? item.amount : -item.amount), 0);

  const confirmDelete = (id: string) => {
    Alert.alert('Delete transaction?', 'This will permanently remove it from your history.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(id) },
    ]);
  };

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TransactionRow transaction={item} index={index} onDelete={() => confirmDelete(item.id)} onPress={() => confirmDelete(item.id)} />
        )}
        contentContainerStyle={[styles.list, filtered.length === 0 && styles.listEmpty]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} colors={[colors.primary]} />}
        ListHeaderComponent={
          <View>
            <View style={styles.titleRow}>
              <View><Text style={[styles.title, { color: colors.text }]}>Transactions</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Every naira, in one place</Text></View>
              <Pressable onPress={() => openAddModal('expense')} style={[styles.addButton, { backgroundColor: colors.primary }]}><Ionicons name="add" size={24} color="#FFFFFF" /></Pressable>
            </View>
            <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="search-outline" size={20} color={colors.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search category or note"
                placeholderTextColor={colors.muted}
                returnKeyType="search"
                style={[styles.searchInput, { color: colors.text }]}
              />
              {query ? <Pressable onPress={() => setQuery('')} hitSlop={8}><Ionicons name="close-circle" size={19} color={colors.muted} /></Pressable> : null}
            </View>
            <View style={styles.filters}>
              {(['all', 'income', 'expense'] as Filter[]).map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setFilter(item)}
                  style={[styles.filterChip, { backgroundColor: filter === item ? colors.primary : colors.surface, borderColor: filter === item ? colors.primary : colors.border }]}
                >
                  <Text style={[styles.filterText, { color: filter === item ? '#FFFFFF' : colors.muted }]}>{item[0].toUpperCase() + item.slice(1)}</Text>
                </Pressable>
              ))}
            </View>
            <View style={[styles.summary, { backgroundColor: colors.surfaceAlt }]}>
              <View><Text style={[styles.summaryLabel, { color: colors.muted }]}>NET TOTAL</Text><Text style={[styles.summaryValue, { color: total >= 0 ? colors.income : colors.expense }]}>{formatNaira(total)}</Text></View>
              <View style={[styles.countPill, { backgroundColor: colors.surface }]}><Text style={[styles.countText, { color: colors.muted }]}>{filtered.length} entries</Text></View>
            </View>
            <Text style={[styles.hint, { color: colors.muted }]}>Tap a transaction to remove it</Text>
          </View>
        }
        ListEmptyComponent={<EmptyState title="Nothing found" message={query ? 'Try a different search or filter.' : 'Add a transaction to start building your history.'} actionLabel={query ? 'Clear search' : 'Add transaction'} onAction={() => query ? setQuery('') : openAddModal('expense')} />}
        ListFooterComponent={<View style={styles.footer} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { paddingHorizontal: 20 },
  listEmpty: { flexGrow: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.8 },
  subtitle: { fontSize: 13, marginTop: 3 },
  addButton: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  search: { height: 52, borderRadius: 17, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginTop: 22 },
  searchInput: { flex: 1, marginLeft: 9, fontSize: 14 },
  filters: { flexDirection: 'row', gap: 9, marginTop: 14 },
  filterChip: { borderWidth: 1, height: 38, paddingHorizontal: 16, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  filterText: { fontSize: 12, fontWeight: '800' },
  summary: { borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 19, marginBottom: 15 },
  summaryLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  summaryValue: { fontSize: 21, fontWeight: '900', marginTop: 4 },
  countPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 11 },
  countText: { fontSize: 11, fontWeight: '700' },
  hint: { fontSize: 11, marginBottom: 3 },
  footer: { height: 32 },
});
