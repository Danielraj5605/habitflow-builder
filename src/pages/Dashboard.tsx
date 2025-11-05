import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Target, TrendingUp, Flame, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useHabits } from "@/contexts/HabitContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { habits, toggleHabitDay } = useHabits();
  const [userName] = useState("Daniel");
  const [currentDate] = useState(new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));
  
  // Get current day of week (0 = Sunday, 1 = Monday, etc.)
  const currentDayIndex = new Date().getDay();
  // Convert to Monday = 0 format (since our week starts with Monday)
  const todayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;

  const motivationalQuotes = [
    "One day at a time.",
    "Progress, not perfection.",
    "Small steps lead to big changes.",
    "You're building a better you.",
    "Consistency beats intensity.",
  ];

  const [dailyQuote] = useState(
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  );

  // Calculate real stats from habits data
  const stats = {
    habitsCreated: habits.length,
    weeklyCompletion: habits.length > 0 ? Math.round(
      (habits.reduce((acc, habit) => acc + habit.currentWeek.filter(Boolean).length, 0) / 
       (habits.length * 7)) * 100
    ) : 0,
    currentStreak: habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0,
    todayCompleted: habits.filter(habit => habit.currentWeek[todayIndex]).length,
    todayTotal: habits.length,
  };
  
  // Filter habits for today based on frequency and current day
  const getTodaysHabits = () => {
    return habits.filter(habit => {
      // For now, show all active habits as today's habits
      // You can modify this logic based on your frequency requirements
      return habit.isActive;
    });
  };
  
  const todaysHabits = getTodaysHabits();

  const handleToggleHabit = (habitId: number) => {
    toggleHabitDay(habitId, todayIndex);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-poppins font-bold text-foreground">
                Welcome back, {userName}! 👋
              </h1>
              <p className="text-sm text-muted-foreground">{currentDate}</p>
            </div>
          </div>
          <Button 
            variant="floating" 
            size="icon" 
            className="relative"
            onClick={() => navigate("/add-habit")}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Motivational Quote */}
        <Card className="bg-gradient-hero text-white border-0 shadow-glow animate-fade-in-up">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-poppins font-semibold mb-2">
              "{dailyQuote}"
            </h2>
            <p className="text-white/80">
              Keep building those amazing habits, one day at a time.
            </p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-soft hover:shadow-medium transition-smooth">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Habits Created
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-primary">
                  {stats.habitsCreated}
                </span>
                <Target className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-smooth">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Weekly Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-success">
                    {stats.weeklyCompletion}%
                  </span>
                  <TrendingUp className="w-8 h-8 text-success/60" />
                </div>
                <Progress value={stats.weeklyCompletion} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-smooth">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-warning">
                  {stats.currentStreak}
                </span>
                <Flame className="w-8 h-8 text-warning streak-flame" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                days in a row
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-smooth">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-primary">
                    {stats.todayCompleted}/{stats.todayTotal}
                  </span>
                  <Calendar className="w-8 h-8 text-primary/60" />
                </div>
                <Progress 
                  value={(stats.todayCompleted / stats.todayTotal) * 100} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Habits */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="font-poppins text-xl">Today's Habits</CardTitle>
            <CardDescription>
              {habits.length === 0 
                ? "Start building better habits today!" 
                : todaysHabits.length === 0 
                  ? "No habits scheduled for today." 
                  : "Keep up the great work! You're doing amazing."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {habits.length === 0 ? (
              // No habits in database at all
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No habits yet!</h3>
                <p className="text-muted-foreground mb-6">
                  Start your journey by creating your first habit.
                </p>
                <Button 
                  variant="hero" 
                  onClick={() => navigate("/add-habit")}
                  className="px-8"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start a New Habit
                </Button>
              </div>
            ) : todaysHabits.length === 0 ? (
              // Has habits but none for today
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  No habits for today
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Enjoy your rest day or add a new habit!
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/add-habit")}
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Habit
                </Button>
              </div>
            ) : (
              // Show today's habits
              <div className="space-y-4">
                {todaysHabits.map((habit) => {
                  const isCompletedToday = habit.currentWeek[todayIndex];
                  return (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-smooth"
                    >
                      <div className="flex items-center gap-3">
                        <Button
                          variant={isCompletedToday ? "success" : "outline"}
                          size="icon"
                          className={isCompletedToday ? "habit-complete" : ""}
                          onClick={() => handleToggleHabit(habit.id)}
                        >
                          {isCompletedToday && "✓"}
                        </Button>
                        <div>
                          <h3 className="font-medium text-card-foreground">
                            {habit.title || habit.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Flame className="w-4 h-4 text-warning" />
                            <span>{habit.streak} day streak</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {habit.frequency}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}