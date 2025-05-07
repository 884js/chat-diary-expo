import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/Themed';

type DayCardProps = {
  day: {
    id: string;
    date: string;
    ai_generated_highlights: {
      good: string[];
      new: string[];
    };
  };
  expandedMessageIds: string[];
  isExpandedDay: boolean;
  onToggleExpandMessage: (messageId: string) => void;
  onToggleExpandDay: (dateKey: string) => void;
  onSummarize: (dateKey: string) => Promise<void>;
};

export const DayCard = ({
  day,
  expandedMessageIds,
  isExpandedDay,
  onToggleExpandMessage,
  onToggleExpandDay,
  onSummarize,
}: DayCardProps) => {
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const dateKey = day.date;
  const formattedDate = format(parseISO(day.date), 'M月d日(eee)', {
    locale: ja,
  });

  const aiGeneratedHighlights = day.ai_generated_highlights || {
    good: [],
    new: [],
  };

  const handleSummarize = async () => {
    setIsGeneratingSummary(true);
    try {
      await onSummarize(dateKey);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const hasHighlights =
    aiGeneratedHighlights.good.length > 0 ||
    aiGeneratedHighlights.new.length > 0;

  return (
    <View style={styles.dayCardContainer}>
      <View style={styles.dayCardHeader}>
        <Text style={styles.dayCardTitle}>{formattedDate}</Text>
        <TouchableOpacity
          style={styles.dayCardButton}
          onPress={handleSummarize}
          disabled={isGeneratingSummary}
        >
          <Text style={styles.dayCardButtonText}>
            {isGeneratingSummary
              ? '実行中...'
              : hasHighlights
              ? '再実行'
              : 'まとめる'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dayCardContent}>
        {hasHighlights && (
          <View style={styles.highlightsContainer}>
            <Text style={styles.highlightsTitle}>この日のできごと</Text>

            {aiGeneratedHighlights.good.length > 0 && (
              <View style={styles.goodHighlights}>
                <View style={styles.highlightHeader}>
                  <Feather name="check" size={14} color="#16a34a" />
                  <Text style={styles.goodHighlightsTitle}>良かったこと</Text>
                </View>
                {aiGeneratedHighlights.good.map((item, index) => (
                  <View key={`good-${item.substring(0, 10)}-${index}`} style={styles.highlightItem}>
                    <Text style={styles.highlightItemText}>• {item}</Text>
                  </View>
                ))}
              </View>
            )}

            {aiGeneratedHighlights.new.length > 0 && (
              <View style={styles.newHighlights}>
                <View style={styles.highlightHeader}>
                  <Feather name="star" size={14} color="#2563eb" />
                  <Text style={styles.newHighlightsTitle}>新しいこと</Text>
                </View>
                {aiGeneratedHighlights.new.map((item, index) => (
                  <View key={`new-${item.substring(0, 10)}-${index}`} style={styles.highlightItem}>
                    <Text style={styles.highlightItemText}>• {item}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dayCardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  dayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dayCardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#475569',
  },
  dayCardButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  dayCardButtonText: {
    fontSize: 12,
    color: '#64748b',
  },
  dayCardContent: {
    padding: 16,
  },
  highlightsContainer: {
    marginBottom: 16,
  },
  highlightsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4f46e5',
    marginBottom: 8,
  },
  goodHighlights: {
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1fae5',
    marginBottom: 8,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goodHighlightsTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#16a34a',
    marginLeft: 4,
  },
  newHighlights: {
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  newHighlightsTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2563eb',
    marginLeft: 4,
  },
  highlightItem: {
    marginLeft: 8,
    marginBottom: 4,
  },
  highlightItemText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  messagesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  showMoreButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  showMoreButtonText: {
    fontSize: 12,
    color: '#6366f1',
  },
});
