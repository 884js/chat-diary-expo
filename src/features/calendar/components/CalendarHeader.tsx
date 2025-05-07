import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Text } from '@/components/Themed';

type CalendarHeaderProps = {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
};

export const CalendarHeader = ({
  currentDate,
  onPreviousMonth,
  onNextMonth,
}: CalendarHeaderProps) => {
  const currentYearMonth = format(currentDate, 'yyyy年M月', { locale: ja });

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        onPress={onPreviousMonth}
        style={styles.headerButton}
      >
        <AntDesign name="arrowleft" size={16} color="#666" />
        <Text style={styles.headerButtonText}>前月</Text>
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>{currentYearMonth}</Text>
      
      <TouchableOpacity
        onPress={onNextMonth}
        style={styles.headerButton}
      >
        <Text style={styles.headerButtonText}>次月</Text>
        <AntDesign name="arrowright" size={16} color="#666" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerButtonText: {
    fontSize: 14,
    color: '#4b5563',
    marginHorizontal: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  }
});
