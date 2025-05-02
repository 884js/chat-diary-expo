import { TZDate } from '@date-fns/tz';
import { differenceInDays, format, formatDistance } from 'date-fns';
import { ja } from 'date-fns/locale';
export { isSameDay, parseISO, addDays, addMonths } from 'date-fns';

/**
 * 日付を指定されたフォーマットに変換する
 * @param date 日付文字列またはDateオブジェクト
 * @param formatStr フォーマット文字列 (デフォルト: 'yyyy/MM/dd HH:mm')
 * @returns フォーマットされた日付文字列
 */
export const formatDate = (
  date: string | Date,
  formatStr = 'yyyy/MM/dd HH:mm',
): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // 無効な日付の場合は空文字を返す
  if (Number.isNaN(dateObj.getTime())) {
    return '';
  }

  return format(dateObj, formatStr, { locale: ja });
};

/**
 * 相対的な時間を表示する（例: 「3分前」「1時間前」など）
 * @param date 日付文字列またはDateオブジェクト
 * @returns 相対的な時間を表す文字列
 */
export const formatRelativeTime = (date: string | Date): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // 無効な日付の場合は空文字を返す
  if (Number.isNaN(dateObj.getTime())) {
    return '';
  }

  return formatDistance(dateObj, new Date(), {
    addSuffix: true,
    locale: ja,
  });
};

/**
 * 日本語でわかりやすい形式の日時を表示する
 * @param date 日付文字列またはDateオブジェクト
 * @returns 「今日 12:34」「昨日 23:45」「2023年5月1日 12:34」などの形式
 */
export const formatJapaneseDateTime = (date: string | Date): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // 無効な日付の場合は空文字を返す
  if (Number.isNaN(dateObj.getTime())) {
    return '';
  }

  const now = new Date();
  const diff = differenceInDays(now, dateObj);

  // 時刻部分
  const time = format(dateObj, 'HH:mm');

  if (diff === 0) {
    // 今日
    return `今日 ${time}`;
  }

  if (diff === 1) {
    // 昨日
    return `昨日 ${time}`;
  }

  // それ以外
  return format(dateObj, 'yyyy年M月d日 HH:mm', { locale: ja });
};

/**
 * 日付を曜日付きの日本語フォーマットに変換する
 * @param date 日付文字列またはDateオブジェクト
 * @returns 「2023年5月1日（月）」などの形式
 */
export const formatJapaneseDateWithWeekday = (date: string | Date): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // 無効な日付の場合は空文字を返す
  if (Number.isNaN(dateObj.getTime())) {
    return '';
  }

  return format(dateObj, 'yyyy年M月d日（E）', { locale: ja });
};

/**
 * チャット履歴用の日時表示
 * @param date 日付文字列またはDateオブジェクト
 * @returns 適切な形式の日時表示
 */
export const formatChatDateTime = (date: string | Date): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // 無効な日付の場合は空文字を返す
  if (Number.isNaN(dateObj.getTime())) {
    return '';
  }

  const now = new Date();
  const diff = differenceInDays(now, dateObj);

  // 時刻部分（ゼロパディングされた時:分）
  const time = format(dateObj, 'HH:mm');

  if (diff === 0) {
    // 今日
    return `今日 ${time}`;
  }

  if (diff === 1) {
    // 昨日
    return `昨日 ${time}`;
  }

  if (diff < 7) {
    // 1週間以内
    return format(dateObj, 'E曜日 HH:mm', { locale: ja });
  }

  // それ以外
  return format(dateObj, 'M月d日 HH:mm', { locale: ja });
};

export const dateWithTZ = (date: Date, tz = 'Asia/Tokyo') => {
  return new TZDate(date, tz);
};
