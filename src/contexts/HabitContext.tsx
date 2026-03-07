import React, { createContext, useContext, useState } from 'react';
import { getHabits as apiGetHabits, addHabit as apiAddHabit, updateHabit as apiUpdateHabit, deleteHabit as apiDeleteHabit, logHabitCompletion as apiLogHabitCompletion, deleteHabitLog as apiDeleteHabitLog } from "@/lib/api";
import { isAuthenticated, isAuthError } from "@/lib/auth";
import { useEffect } from "react";

interface Habit {
  id: number;
  name: string;
  description: string;
  frequency: string;
  created_at?: string;
  updated_at?: string;
  currentWeek: boolean[];
  weeklyGoal: number;
  isActive: boolean;
  tags: string[];
  title: string;
  icon: string;
  identityStatement?: string;
  streak: number;
  consistencyScore: number;
}

interface HabitContextType {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  addHabit: (habit: { 
    name: string; 
    description?: string; 
    frequency: string; 
    identity_statement?: string;
    icon?: string;
    weekly_goal?: number;
    tags?: string[];
  }) => Promise<void>;
  updateHabit: (id: number, updates: Partial<Habit> & { 
    identity_statement?: string;
    name?: string;
    weekly_goal?: number;
    is_active?: boolean;
  }) => Promise<void>;
  deleteHabit: (id: number) => Promise<void>;
  toggleHabitDay: (habitId: number, dayIndex: number) => Promise<void>;
  getHabitById: (id: number) => Habit | undefined;
  refreshHabits: () => Promise<void>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const refreshHabits = React.useCallback(async () => {
    if (!isAuthenticated()) {
      setHabits([]);
      setLoading(false);
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetHabits();
      const transformedData = data.map((habit: any) => ({
        ...habit,
        title: habit.name,
        currentWeek: habit.currentWeek || new Array(7).fill(false),
        weeklyGoal: habit.weekly_goal || habit.weeklyGoal || 7,
        isActive: habit.is_active !== undefined ? habit.is_active : habit.isActive !== undefined ? habit.isActive : true,
        tags: habit.tags || [],
        icon: habit.icon || '🎯',
        identityStatement: habit.identity_statement || habit.identityStatement || '',
        streak: habit.streak || 0,
        consistencyScore: habit.consistency_score || habit.consistencyScore || 0,
      }));
      setHabits(transformedData);
    } catch (err) {
      console.error("Failed to refresh habits:", err);
      
      // If it's an authentication error, don't show it as an error to user
      if (err instanceof Error && isAuthError(err)) {
        setError(null);
        setHabits([]);
      } else {
        setError(err instanceof Error ? err.message : "Failed to fetch habits");
        setHabits([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshHabits();
  }, [refreshHabits]);

  const addHabit = async (habitData: { 
    name: string; 
    description?: string; 
    frequency: string; 
    identity_statement?: string;
    icon?: string;
    weekly_goal?: number;
    tags?: string[];
  }) => {
    await apiAddHabit(habitData);
    // Refetch all habits to get the complete data from backend
    await refreshHabits();
  };

  const updateHabit = async (id: number, updates: Partial<Habit>) => {
    // Map camelCase to snake_case for backend
    const apiUpdates: any = { ...updates };
    if (updates.weeklyGoal !== undefined) apiUpdates.weekly_goal = updates.weeklyGoal;
    if (updates.isActive !== undefined) apiUpdates.is_active = updates.isActive;
    if (updates.identityStatement !== undefined) apiUpdates.identity_statement = updates.identityStatement;
    if (updates.consistencyScore !== undefined) apiUpdates.consistency_score = updates.consistencyScore;
    
    // Remove camelCase fields to avoid sending redundant data
    delete apiUpdates.weeklyGoal;
    delete apiUpdates.isActive;
    delete apiUpdates.identityStatement;
    delete apiUpdates.consistencyScore;

    await apiUpdateHabit(id.toString(), apiUpdates);
    setHabits(prev => prev.map(habit => habit.id === id ? { ...habit, ...updates } : habit));
  };

  const deleteHabit = async (id: number) => {
    await apiDeleteHabit(id.toString());
    setHabits(prev => prev.filter(habit => habit.id !== id));
  };

  async function toggleHabitDay(habitId: number, dayIndex: number) {
    const habitToUpdate = habits.find(habit => habit.id === habitId);
    if (!habitToUpdate) return;
  
    const newCurrentWeek = [...habitToUpdate.currentWeek];
    const isCompleted = !newCurrentWeek[dayIndex];
    newCurrentWeek[dayIndex] = isCompleted;
  
    // Calculate the date for the specific day index
    const today = new Date();
    const currentDayIndex = today.getDay();
    const mondayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
    const daysOffset = dayIndex - mondayIndex;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysOffset);
    const completedDate = targetDate.toISOString();
  
    try {
      if (isCompleted) {
        await apiLogHabitCompletion(habitId.toString(), completedDate);
      } else {
        await apiDeleteHabitLog(habitId.toString(), completedDate);
      }
  
      // Update currentWeek in backend
      await apiUpdateHabit(habitId.toString(), { currentWeek: newCurrentWeek });
      
      // Refetch habits to get updated streak and other calculated fields
      await refreshHabits();
    } catch (error) {
      console.error("Failed to toggle habit day:", error);
      // Revert optimistic update on error
      throw error;
    }
  }

  const getHabitById = (id: number) => {
    return habits.find(habit => habit.id === id);
  };

  return (
    <HabitContext.Provider value={{
      habits,
      loading,
      error,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleHabitDay,
      getHabitById,
      refreshHabits,
    }}>
      {children}
    </HabitContext.Provider>
  );
};