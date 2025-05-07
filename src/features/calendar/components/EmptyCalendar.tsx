import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/Themed';

export const EmptyCalendar = () => {
  return (
    <View style={styles.emptyContainer}>
      <Feather name="calendar" size={64} color="#9ca3af" style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>この月の投稿はありません</Text>
      <Text style={styles.emptyText}>
        別の月を選択するか、新しく書き始めましょう
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    margin: 16,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
