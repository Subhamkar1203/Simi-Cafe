"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarClock, Sunrise, Sun, Moon } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

interface ReservationSchedulerProps {
  initialDate?: Date;
  timeSlots: string[];
  timeZone?: string;
  onSchedule: (dateTime: { date: Date; time: string } | null) => void;
  className?: string;
  selectedDate: Date | null;
  selectedTime: string | null;
}

const scheduleButtonVariants = cva(
  'relative isolate inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-bold transition-all focus:outline-none disabled:pointer-events-none disabled:opacity-50 overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-[rgb(var(--surface-raised)_/_0.7)] border border-[rgb(var(--border-soft)_/_0.8)] text-[rgb(var(--foreground)_/_0.9)] hover:bg-[rgb(var(--surface-raised))] hover:shadow-md hover:border-[rgb(var(--accent)_/_0.4)]',
        selected: 'text-[rgb(var(--accent-foreground))] shadow-[0_0_20px_rgba(var(--accent)_/_0.4)] border border-[rgb(var(--accent))]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const getWeekDays = (startDate: Date): Date[] => {
  const days: Date[] = [];
  const startOfWeek = new Date(startDate);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); 
  startOfWeek.setDate(diff);

  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(startOfWeek);
    nextDay.setDate(startOfWeek.getDate() + i);
    days.push(nextDay);
  }
  return days;
};

export const ReservationScheduler: React.FC<ReservationSchedulerProps> = ({
  initialDate = new Date(),
  timeSlots,
  timeZone = "Local Time",
  onSchedule,
  className,
  selectedDate,
  selectedTime
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 14); // Extended to 2 weeks

  const weekDays = getWeekDays(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  const handleDateSelect = (date: Date) => {
    // If navigating to a different week by clicking Today/Tomorrow, adjust week view
    const newWeekStart = new Date(date);
    const day = newWeekStart.getDay();
    const diff = newWeekStart.getDate() - day + (day === 0 ? -6 : 1);
    newWeekStart.setDate(diff);
    
    // Only update current date if we jump out of the current week view
    if (newWeekStart.getTime() !== getWeekDays(currentDate)[0].getTime()) {
      setCurrentDate(date);
    }
    
    onSchedule({ date, time: selectedTime || timeSlots[0] });
  };
  
  const handleTimeSelect = (time: string) => {
    if (selectedDate) {
      onSchedule({ date: selectedDate, time });
    } else {
      onSchedule({ date: new Date(), time });
    }
  };

  const changeWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };
  
  const handleClear = () => {
    onSchedule(null);
  };

  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];
  
  const canGoPrev = weekStart > today;
  const canGoNext = weekEnd < maxDate;

  // Group time slots
  const groupedTimeSlots = useMemo(() => {
    const checkDate = selectedDate || today;
    const isToday = checkDate.toDateString() === today.toDateString();
    const now = new Date();

    const groups: Record<string, string[]> = {
      "Morning": [],
      "Afternoon": [],
      "Evening": []
    };

    timeSlots.forEach((time) => {
      const [start] = time.split(" - ");
      const [timeStr, modifier] = start.split(" ");
      let [hours, minutes] = timeStr.split(":");
      let h = parseInt(hours, 10);
      if (h === 12) h = 0;
      if (modifier === "PM") h += 12;

      // Filter out past times if today
      if (isToday) {
        const slotTime = new Date(now);
        slotTime.setHours(h, parseInt(minutes, 10), 0, 0);
        if (slotTime <= now) return;
      }

      if (h < 12) {
        groups["Morning"].push(time);
      } else if (h < 17) {
        groups["Afternoon"].push(time);
      } else {
        groups["Evening"].push(time);
      }
    });

    return groups;
  }, [timeSlots, selectedDate, today]);

  const groupIcons: Record<string, React.ReactNode> = {
    "Morning": <Sunrise className="size-4" />,
    "Afternoon": <Sun className="size-4" />,
    "Evening": <Moon className="size-4" />
  };

  return (
    <div className={cn('w-full rounded-[2.5rem] border border-[rgb(var(--border-soft)_/_0.8)] bg-[rgb(var(--surface)_/_0.85)] p-5 sm:p-8 shadow-md backdrop-blur-3xl dark:bg-[rgb(var(--surface)_/_0.8)] transition-all', className)}>
      <div className="space-y-8">
        
        {/* Date Selection Header */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[rgb(var(--foreground)_/_0.6)]">
              <CalendarClock className="size-4" /> Pick a Date
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDateSelect(today)}
                className={cn("px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all", selectedDate?.toDateString() === today.toDateString() ? "bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] shadow-md" : "bg-[rgb(var(--surface-muted))] hover:bg-[rgb(var(--surface-raised))] border border-[rgb(var(--border-soft))]")}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleDateSelect(tomorrow)}
                className={cn("px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all", selectedDate?.toDateString() === tomorrow.toDateString() ? "bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] shadow-md" : "bg-[rgb(var(--surface-muted))] hover:bg-[rgb(var(--surface-raised))] border border-[rgb(var(--border-soft))]")}
              >
                Tomorrow
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between bg-[rgb(var(--surface-muted)_/_0.5)] rounded-2xl p-2 border border-[rgb(var(--border-soft)_/_0.5)]">
            <button 
              type="button" 
              onClick={() => changeWeek('prev')} 
              disabled={!canGoPrev}
              className="flex size-10 items-center justify-center rounded-xl bg-[rgb(var(--surface))] shadow-sm hover:bg-[rgb(var(--surface-raised))] hover:scale-105 transition-all border border-[rgb(var(--border-soft))] disabled:opacity-30 disabled:pointer-events-none disabled:hover:scale-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-xl font-bold tracking-tight">{monthYear}</h3>
            <button 
              type="button" 
              onClick={() => changeWeek('next')} 
              disabled={!canGoNext}
              className="flex size-10 items-center justify-center rounded-xl bg-[rgb(var(--surface))] shadow-sm hover:bg-[rgb(var(--surface-raised))] hover:scale-105 transition-all border border-[rgb(var(--border-soft))] disabled:opacity-30 disabled:pointer-events-none disabled:hover:scale-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Day Selection */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const isSelected = selectedDate?.toDateString() === day.toDateString();
            
            const checkDay = new Date(day);
            checkDay.setHours(0, 0, 0, 0);
            
            const isPast = checkDay < today;
            const isTooFar = checkDay > maxDate;
            const isDisabled = isPast || isTooFar;

            if (isDisabled) {
              return (
                <div key={day.toISOString()} className="relative flex flex-col items-center opacity-30">
                  <span className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--foreground)_/_0.5)]">
                    {day.toLocaleDateString('en-US', { weekday: 'narrow' })}
                  </span>
                  <div className="flex size-10 items-center justify-center p-0 rounded-full bg-[rgb(var(--surface-muted)_/_0.5)] text-sm font-bold">
                    {day.getDate()}
                  </div>
                </div>
              );
            }

            return (
              <div key={day.toISOString()} className="relative flex flex-col items-center group">
                <span className={cn("mb-2 text-[11px] font-bold uppercase tracking-widest transition-colors", isSelected ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--foreground)_/_0.5)] group-hover:text-[rgb(var(--foreground))]")}>
                  {day.toLocaleDateString('en-US', { weekday: 'narrow' })}
                </span>
                <button
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={cn(
                    scheduleButtonVariants({ variant: isSelected ? 'selected' : 'default' }), 
                    'flex size-10 lg:size-12 items-center justify-center p-0 rounded-2xl group-hover:-translate-y-1'
                  )}
                >
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        layoutId="date-selector"
                        className="absolute inset-0 z-0 rounded-2xl bg-[rgb(var(--accent))]"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      />
                    )}
                  </AnimatePresence>
                  <span className={cn("relative z-10 transition-colors text-base", isSelected && "text-[rgb(var(--accent-foreground))]")}>
                    {day.getDate()}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Time Selection */}
        <div className="pt-6 border-t border-[rgb(var(--border-soft)_/_0.5)]">
          <div className="flex items-center justify-between mb-5">
            <label className="text-sm font-bold uppercase tracking-wider text-[rgb(var(--foreground)_/_0.6)]">Select Time</label>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--foreground)_/_0.4)] bg-[rgb(var(--surface-muted))] px-2 py-1 rounded-full">{timeZone}</span>
          </div>
          
          <div className="max-h-[380px] overflow-y-auto pr-3 custom-scrollbar space-y-6">
            {Object.entries(groupedTimeSlots).map(([groupName, slots]) => {
              if (slots.length === 0) return null;
              
              return (
                <div key={groupName} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[rgb(var(--forest))] mb-3">
                    {groupIcons[groupName]} {groupName}
                  </h4>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {slots.map((time) => {
                      const isSelected = selectedTime === time;
                      
                      return (
                        <button
                          type="button"
                          key={time}
                          onClick={() => handleTimeSelect(time)}
                          className={cn(
                            scheduleButtonVariants({ variant: isSelected ? 'selected' : 'default' }),
                            "h-[3.5rem] px-3 hover:-translate-y-0.5"
                          )}
                        >
                           <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                layoutId="time-selector"
                                className="absolute inset-0 z-0 rounded-2xl bg-[rgb(var(--accent))]"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                              />
                            )}
                          </AnimatePresence>
                          <span className={cn("relative z-10 transition-colors tracking-wide text-[13px] sm:text-sm text-center", isSelected && "text-[rgb(var(--accent-foreground))]")}>
                            {time}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            {Object.values(groupedTimeSlots).every(slots => slots.length === 0) && (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
                <Moon className="size-8 mb-3" />
                <p className="text-sm font-bold">No times available for this date.</p>
                <p className="text-xs mt-1">Please select another day.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end border-t border-[rgb(var(--border-soft)_/_0.5)] pt-6">
           <button 
             type="button"
             onClick={handleClear}
             className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--foreground)_/_0.5)] hover:text-[rgb(var(--foreground))] transition-colors underline decoration-dotted underline-offset-4"
           >
             Clear Selection
           </button>
        </div>
      </div>
    </div>
  );
};
