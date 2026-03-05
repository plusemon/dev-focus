import React, { useState, useMemo } from 'react';
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

interface DatePickerProps {
  value: number | null | undefined;
  onChange: (date: number | null) => void;
  label?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label = 'Due Date' }) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate 7 days including today
  const next7Days = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  }, []);

  // Get day name (Today, Tomorrow, or weekday)
  const getDayLabel = (date: Date, index: number): string => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    return WEEKDAYS[date.getDay()];
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Check if a date is selected
  const isSelected = (date: Date): boolean => {
    if (!value) return false;
    const selectedDate = new Date(value);
    return (
      selectedDate.getDate() === date.getDate() &&
      selectedDate.getMonth() === date.getMonth() &&
      selectedDate.getFullYear() === date.getFullYear()
    );
  };

  // Handle quick date selection
  const handleQuickSelect = (date: Date) => {
    onChange(date.getTime());
  };

  // Handle clearing the date
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  // Convert timestamp to YYYY-MM-DD for custom input
  const formatDateForInput = (timestamp: number | null | undefined): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0];
  };

  // Convert YYYY-MM-DD input to timestamp
  const parseDateFromInput = (dateString: string): number | null => {
    if (!dateString) return null;
    return new Date(dateString).getTime();
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = parseDateFromInput(e.target.value);
    onChange(newDate);
  };

  // Check if value is overdue
  const isOverdue = value && value < Date.now();

  // Calendar view helpers
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentMonth]);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthYearLabel = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-2">
      <label className="text-slate-500 text-xs font-semibold uppercase flex items-center gap-2">
        <Calendar size={12} /> {label}
      </label>

      {/* Quick Select: 7 Days */}
      <div className="grid grid-cols-7 gap-1">
        {next7Days.map((date, index) => (
          <button
            key={date.toISOString()}
            type="button"
            onClick={() => handleQuickSelect(date)}
            className={cn(
              'flex flex-col items-center justify-center p-2 rounded-lg border transition-all text-xs',
              isSelected(date)
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500'
            )}
          >
            <span className="font-medium">{getDayLabel(date, index)}</span>
            <span className={cn('text-[10px] opacity-80', isSelected(date) ? 'text-indigo-100' : 'text-slate-500')}>
              {formatDate(date)}
            </span>
          </button>
        ))}
      </div>

      {/* Custom Date Button & Clear */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          className={cn(
            'flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
            showCustomPicker
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
          )}
        >
          {showCustomPicker ? 'Hide Calendar' : 'Custom Date'}
        </button>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Clear due date"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Custom Date Picker */}
      {showCustomPicker && (
        <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {monthYearLabel}
            </span>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-medium text-slate-400 uppercase py-1"
              >
                {day.charAt(0)}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) =>
              date ? (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => handleQuickSelect(date)}
                  className={cn(
                    'aspect-square flex items-center justify-center text-xs rounded-md transition-colors',
                    isSelected(date)
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  )}
                >
                  {date.getDate()}
                </button>
              ) : (
                <div key={`empty-${index}`} className="aspect-square" />
              )
            )}
          </div>

          {/* Manual Date Input */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <input
              type="date"
              value={formatDateForInput(value)}
              onChange={handleCustomDateChange}
              className={cn(
                'w-full bg-slate-100 dark:bg-slate-800 border rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 outline-none',
                'text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                isOverdue && 'border-red-500/50 text-red-600 dark:text-red-400'
              )}
            />
          </div>
        </div>
      )}

      {/* Selected Date Display */}
      {value && (
        <span
          className={cn(
            'text-xs',
            isOverdue ? 'text-red-500 font-medium' : 'text-slate-400'
          )}
        >
          {isOverdue
            ? 'Overdue'
            : `Due: ${new Date(value).toLocaleDateString()}`}
        </span>
      )}
    </div>
  );
};
