import { addDays, addWeeks, format, startOfWeek, subWeeks } from 'date-fns';

export type WeekDay = {
  date: Date;
  dateString: string; // 'yyyy-MM-dd' format
  day: number;
  isToday: boolean;
  isCurrentMonth: boolean;
};

/**
 * 指定した日付の週の日付配列を取得
 * @param date 基準日
 * @param currentMonth 現在表示中の月（月が違う日は薄く表示するため）
 * @returns 週の日付配列（月曜始まり）
 */
export const getWeekDays = (date: Date, currentMonth: Date): WeekDay[] => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // 月曜始まり
  const today = new Date();

  return Array.from({ length: 7 }, (_, i) => {
    const currentDate = addDays(weekStart, i);

    return {
      date: currentDate,
      dateString: format(currentDate, 'yyyy-MM-dd'),
      day: currentDate.getDate(),
      isToday:
        format(currentDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'),
      isCurrentMonth: currentDate.getMonth() === currentMonth.getMonth(),
    };
  });
};

/**
 * 週の日本語曜日ラベル配列を取得
 */
export const getWeekdayLabels = (): string[] => {
  return ['月', '火', '水', '木', '金', '土', '日'];
};

/**
 * 指定した日付が含まれる週の配列を複数週分取得
 * @param centerDate 中心となる日付
 * @param currentMonth 現在表示中の月
 * @param weeksCount 取得する週数（前後含む）
 * @returns 週データの配列
 */
export const getMultipleWeeks = (
  centerDate: Date,
  currentMonth: Date,
  weeksCount = 5,
): WeekDay[][] => {
  const weeks: WeekDay[][] = [];
  const halfWeeks = Math.floor(weeksCount / 2);

  for (let i = -halfWeeks; i <= halfWeeks; i++) {
    const weekDate = i === 0 ? centerDate : addWeeks(centerDate, i);
    weeks.push(getWeekDays(weekDate, currentMonth));
  }

  return weeks;
};

/**
 * 日付から週のインデックスを計算
 * @param date 対象日
 * @param baseDate 基準日
 * @returns 週のインデックス
 */
export const getWeekIndex = (date: Date, baseDate: Date): number => {
  const diffWeeks = Math.floor(
    (date.getTime() - baseDate.getTime()) / (7 * 24 * 60 * 60 * 1000),
  );
  return diffWeeks;
};

/**
 * 前の週の日付を取得
 */
export const getPreviousWeek = (date: Date): Date => {
  return subWeeks(date, 1);
};

/**
 * 次の週の日付を取得
 */
export const getNextWeek = (date: Date): Date => {
  return addWeeks(date, 1);
};

/**
 * 指定した開始日から連続する週を生成する（無限スクロール用）
 * @param startDate 開始日
 * @param count 生成する週数
 * @param direction 方向（'forward' = 未来方向, 'backward' = 過去方向）
 * @returns 週データの配列
 */
export const generateConsecutiveWeeks = (
  startDate: Date,
  count: number,
  direction: 'forward' | 'backward' = 'forward',
): WeekDay[][] => {
  const weeks: WeekDay[][] = [];

  for (let i = 0; i < count; i++) {
    const weekOffset = direction === 'forward' ? i : -i;
    const weekDate = addWeeks(startDate, weekOffset);
    weeks.push(getWeekDays(weekDate, weekDate));
  }

  return direction === 'backward' ? weeks.reverse() : weeks;
};

/**
 * 既存の週配列の前に新しい週を追加
 * @param existingWeeks 既存の週配列
 * @param additionalCount 追加する週数
 * @returns 新しい週配列
 */
export const prependWeeks = (
  existingWeeks: WeekDay[][],
  additionalCount: number,
): WeekDay[][] => {
  if (existingWeeks.length === 0) return [];

  // 既存の最初の週の開始日から更に過去へ
  const firstWeek = existingWeeks[0];
  const firstDate = firstWeek[0].date;
  const startDate = subWeeks(firstDate, additionalCount);

  const newWeeks = generateConsecutiveWeeks(
    startDate,
    additionalCount,
    'forward',
  );
  return [...newWeeks, ...existingWeeks];
};

/**
 * 既存の週配列の後に新しい週を追加
 * @param existingWeeks 既存の週配列
 * @param additionalCount 追加する週数
 * @returns 新しい週配列
 */
export const appendWeeks = (
  existingWeeks: WeekDay[][],
  additionalCount: number,
): WeekDay[][] => {
  if (existingWeeks.length === 0) return [];

  // 既存の最後の週の終了日から更に未来へ
  const lastWeek = existingWeeks[existingWeeks.length - 1];
  const lastDate = lastWeek[6].date;
  const startDate = addWeeks(lastDate, 1);

  const newWeeks = generateConsecutiveWeeks(
    startDate,
    additionalCount,
    'forward',
  );
  return [...existingWeeks, ...newWeeks];
};
