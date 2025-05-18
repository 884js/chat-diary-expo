import { SafeAreaView } from '@/components/SafeAreaView';
import { CalendarScreen } from '@/features/calendar/screens/CalendarScreen';

// メインのカレンダー画面
export default function Calendar() {
  return (
    <SafeAreaView>
      <CalendarScreen />
    </SafeAreaView>
  );
}
