import { format, parseISO } from 'date-fns';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';

type CalendarMessageProps = {
  message: {
    id: string;
    content: string | null;
    created_at: string;
    image_path?: string | null;
  };
  isExpanded: boolean;
  onToggleExpand: (messageId: string) => void;
  isLast: boolean;
};

export const CalendarMessage = ({
  message,
  isExpanded,
  onToggleExpand,
  isLast,
}: CalendarMessageProps) => {
  const messageTime = format(parseISO(message.created_at), 'HH:mm');
  const content = message.content || '（無題）';

  return (
    <View style={styles.messageContainer}>
      <View style={styles.messageContent}>
        <Text style={styles.messageTime}>{messageTime}</Text>
        <Text
          style={styles.messageText}
          numberOfLines={isExpanded ? undefined : 3}
        >
          {content}
        </Text>
      </View>

      {content.length > 100 && (
        <TouchableOpacity
          onPress={() => onToggleExpand(message.id)}
          style={styles.messageButton}
        >
          <Text style={styles.messageButtonText}>
            {isExpanded ? '閉じる' : '続きを読む'}
          </Text>
        </TouchableOpacity>
      )}

      {message.image_path && (
        <View style={styles.messageImageContainer}>
          <Text style={styles.messageImageText}>画像あり</Text>
        </View>
      )}

      {!isLast && <View style={styles.messageDivider} />}
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginBottom: 8,
  },
  messageContent: {
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  messageButton: {
    marginTop: 4,
  },
  messageButtonText: {
    fontSize: 12,
    color: '#6366f1',
  },
  messageImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  messageImageText: {
    fontSize: 12,
    color: '#6366f1',
  },
  messageDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 8,
  },
});
