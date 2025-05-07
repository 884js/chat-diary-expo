import { FlatList, View } from 'react-native';
import { DayCard } from './DayCard';

type CalendarGridProps = {
  calendarDays: Array<{
    id: string;
    date: string;
    ai_generated_highlights: {
      good: string[];
      new: string[];
    };
  }>;
  expandedMessageIds: string[];
  expandedDays: string[];
  onToggleExpandMessage: (messageId: string) => void;
  onToggleExpandDay: (dateKey: string) => void;
  onSummarize: (dateKey: string) => Promise<void>;
};

export const CalendarGrid = ({
  calendarDays,
  expandedMessageIds,
  expandedDays,
  onToggleExpandMessage,
  onToggleExpandDay,
  onSummarize,
}: CalendarGridProps) => {
  const renderItem = ({ item }: { item: typeof calendarDays[0] }) => {
    const dateKey = item.date;
    const isExpandedDay = expandedDays.includes(dateKey);

    return (
      <DayCard
        day={item}
        expandedMessageIds={expandedMessageIds}
        isExpandedDay={isExpandedDay}
        onToggleExpandMessage={onToggleExpandMessage}
        onToggleExpandDay={onToggleExpandDay}
        onSummarize={onSummarize}
      />
    );
  };

  return (
    <FlatList
      data={calendarDays}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      className="p-4"
      ItemSeparatorComponent={() => <View className="h-3" />}
      showsVerticalScrollIndicator={false}
    />
  );
};
