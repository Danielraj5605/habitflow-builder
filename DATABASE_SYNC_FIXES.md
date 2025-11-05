# Database Sync Fixes - HabitFlow

## Overview
This document outlines all the fixes applied to resolve database sync issues in the HabitFlow application.

## Problems Identified

### 1. API Endpoint Mismatches
- **Issue**: Frontend was calling `/habits/{id}/log` but backend exposed `/habits/{id}/logs`
- **Impact**: Habit logging and deletion failed silently

### 2. Habit Logging Logic
- **Issue**: Backend prevented duplicate logs for the same date (raised 400 error)
- **Impact**: Users couldn't toggle habits on/off for the same day

### 3. Missing Habit Refetch
- **Issue**: Frontend didn't refetch habits after creation
- **Impact**: Newly created habits missing backend-calculated fields (streak, etc.)

### 4. Streak Not Updated
- **Issue**: Backend calculated streak but didn't return updated habit after logging
- **Impact**: Streak displayed stale data until page refresh

### 5. Missing Database Table
- **Issue**: `habit_summary` table was not in the database schema
- **Impact**: Summary endpoints failed with database errors

## Fixes Applied

### Backend Changes

#### 1. Fixed Habit Logging Endpoint (`backend/app/routers/habits.py`)
```python
# Changed from raising error to updating existing log
if existing_log:
    # Update existing log instead of raising error
    if habit_log.notes:
        existing_log.notes = habit_log.notes
    db.commit()
    db.refresh(existing_log)
    update_habit_summary(db, current_user.id, habit_id, habit_log.completed_date.date())
    return existing_log
```

#### 2. Added Delete by Date Endpoint (`backend/app/routers/habits.py`)
```python
@router.delete("/{habit_id}/logs/by-date")
def delete_habit_log_by_date(
    habit_id: int,
    completed_date: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a habit log by date (for toggle functionality)"""
    # Implementation allows deleting logs by date string
```

#### 3. Enhanced GET /habits Endpoint
```python
# Calculate and update streaks for each habit on fetch
for habit in habits:
    calculated_streak = calculate_habit_streak(db, habit.id, current_user.id)
    habit.streak = calculated_streak
    if habit.streak != calculated_streak:
        db.query(Habit).filter(Habit.id == habit.id).update({"streak": calculated_streak})
db.commit()
```

#### 4. Added habit_summary Table (`backend/database_schema.sql`)
```sql
CREATE TABLE IF NOT EXISTS habit_summary (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    summary_date DATE NOT NULL,
    completion_rate FLOAT DEFAULT 0.0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, habit_id, summary_date)
);
```

### Frontend Changes

#### 1. Fixed API Endpoints (`src/lib/api.ts`)
```typescript
// Changed from /habits/{id}/log to /habits/{id}/logs
export const logHabitCompletion = async (habitId: string, completedDate: string) => {
  const response = await fetch(`${API_BASE_URL}/habits/${habitId}/logs`, {
    method: "POST",
    body: JSON.stringify({ habit_id: parseInt(habitId), completed_date: completedDate }),
  });
  // ...
};

// Changed to use query parameter for delete by date
export const deleteHabitLog = async (habitId: string, completedDate: string) => {
  const response = await fetch(
    `${API_BASE_URL}/habits/${habitId}/logs/by-date?completed_date=${encodeURIComponent(completedDate)}`,
    { method: "DELETE" }
  );
  // ...
};
```

#### 2. Added Habit Refetch (`src/contexts/HabitContext.tsx`)
```typescript
const addHabit = async (habitData: { name: string; description?: string; frequency: string }) => {
  await apiAddHabit(habitData);
  // Refetch all habits to get the complete data from backend
  await refreshHabits();
};
```

#### 3. Enhanced Toggle Logic
```typescript
async function toggleHabitDay(habitId: number, dayIndex: number) {
  // Calculate the correct date for the day index
  const today = new Date();
  const currentDayIndex = today.getDay();
  const mondayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
  const daysOffset = dayIndex - mondayIndex;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysOffset);
  const completedDate = targetDate.toISOString();
  
  // Log or delete based on completion state
  if (isCompleted) {
    await apiLogHabitCompletion(habitId.toString(), completedDate);
  } else {
    await apiDeleteHabitLog(habitId.toString(), completedDate);
  }
  
  // Refetch to get updated streaks
  await refreshHabits();
}
```

#### 4. Added Loading and Error States
```typescript
interface HabitContextType {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  // ... other methods
  refreshHabits: () => Promise<void>;
}

const refreshHabits = React.useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await apiGetHabits();
    // Transform and set habits
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to fetch habits");
  } finally {
    setLoading(false);
  }
}, []);
```

## Testing Checklist

### 1. Habit Creation
- [ ] Create a new habit
- [ ] Verify it appears immediately in the habit list
- [ ] Check that all fields are populated (name, description, icon, streak=0)

### 2. Habit Logging
- [ ] Mark a habit as complete for today
- [ ] Verify the checkmark appears
- [ ] Check that streak increments (if consecutive days)
- [ ] Verify habit summary updates

### 3. Habit Toggle
- [ ] Mark a habit complete
- [ ] Unmark the same habit
- [ ] Verify it can be toggled multiple times
- [ ] Check that streak recalculates correctly

### 4. Data Persistence
- [ ] Create and log habits
- [ ] Refresh the page
- [ ] Verify all data persists correctly

### 5. Summary Updates
- [ ] Complete multiple habits
- [ ] Check dashboard statistics update
- [ ] Verify weekly completion percentage
- [ ] Check streak calculations

## Database Migration

If using an existing database, run the following to add the missing table:

```sql
-- Run this on your PostgreSQL database
CREATE TABLE IF NOT EXISTS habit_summary (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    summary_date DATE NOT NULL,
    completion_rate FLOAT DEFAULT 0.0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, habit_id, summary_date)
);

CREATE INDEX IF NOT EXISTS idx_habit_summary_user_id ON habit_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_summary_habit_id ON habit_summary(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_summary_date ON habit_summary(summary_date);
```

## API Endpoints Summary

### Habits
- `GET /habits` - Fetch all habits (with updated streaks)
- `POST /habits` - Create new habit
- `PUT /habits/{id}` - Update habit
- `DELETE /habits/{id}` - Delete habit (soft delete)

### Habit Logs
- `POST /habits/{id}/logs` - Log habit completion (creates or updates)
- `GET /habits/{id}/logs` - Get all logs for a habit
- `DELETE /habits/{id}/logs/{log_id}` - Delete log by ID
- `DELETE /habits/{id}/logs/by-date?completed_date={date}` - Delete log by date

### Summary
- `GET /summary/` - Get habit summaries
- `GET /summary/overall` - Get overall statistics
- `GET /summary/weekly` - Get weekly summary
- `GET /summary/top-habits` - Get top performing habits
- `GET /summary/daily-completions` - Get daily completion data

## Known Limitations

1. **currentWeek Array**: The `currentWeek` field in the Habit model stores a boolean array for the week. This needs to be synchronized with actual habit logs for accuracy.

2. **Timezone Handling**: Date calculations assume local timezone. For production, consider UTC standardization.

3. **Streak Calculation**: Current implementation calculates streaks based on consecutive days. May need adjustment for habits with different frequencies (weekly, custom).

## Next Steps

1. Add optimistic UI updates for better UX
2. Implement real-time sync using WebSockets
3. Add offline support with local caching
4. Improve error messages and user feedback
5. Add unit tests for critical functions
6. Consider adding a background job to recalculate streaks daily
