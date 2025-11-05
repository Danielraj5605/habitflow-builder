import React, { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { fetchWithAuth } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, Flame, Target, Award, BarChart3, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface OverallSummary {
  total_habits: number;
  active_habits: number;
  overall_completion_rate: number;
  current_streak: number;
  longest_streak: number;
  total_completions: number;
}

interface WeeklySummary {
  week_start: string;
  completion_rate: number;
}

interface HabitSummaryData {
  habit_id: string;
  habit_name: string;
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  completion_rate: number;
}

interface DailyCompletion {
  date: string;
  count: number;
}

export default function Summary() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [overallSummary, setOverallSummary] = useState<OverallSummary | null>(null);
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([]);
  const [topHabits, setTopHabits] = useState<HabitSummaryData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyCompletions, setDailyCompletions] = useState<DailyCompletion[]>([]);

  useEffect(() => {
    const fetchOverallSummary = async () => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/summary/overall`);
            setOverallSummary(response);
        } catch (error) {
            console.error("Failed to fetch overall summary:", error);
            toast({
                title: "Error",
                description: "Failed to load overall summary data.",
                variant: "destructive",
            });
        }
    };

    const fetchWeeklySummary = async () => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/summary/weekly`);
            setWeeklySummaries(response);
        } catch (error) {
            console.error("Failed to fetch weekly summary:", error);
            toast({
                title: "Error",
                description: "Failed to load weekly summary data.",
                variant: "destructive",
            });
        }
    };

    const fetchTopHabits = async () => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/summary/top-habits`);
            setTopHabits(response);
        } catch (error) {
            console.error("Failed to fetch top habits:", error);
            toast({
                title: "Error",
                description: "Failed to load top habits data.",
                variant: "destructive",
            });
        }
    };

    const fetchDailyCompletions = async () => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/summary/daily-completions`);
            setDailyCompletions(response);
        } catch (error) {
            console.error("Failed to fetch daily completions:", error);
            toast({
                title: "Error",
                description: "Failed to load daily completions data.",
                variant: "destructive",
            });
        }
    };

    const fetchSummaryData = async () => {
        setLoading(true);
        setError(null);
        try {
            await fetchOverallSummary();
            await fetchWeeklySummary();
            await fetchTopHabits();
            await fetchDailyCompletions();
        } catch (err) {
            console.error("Failed to fetch summary data:", err);
            setError("Failed to load summary data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    fetchSummaryData();
  }, []);

  // Calculate real statistics from habits data
  const calculateStats = () => {
    if (!overallSummary) {
      return {
        monthlyCompletion: 0,
        bestStreak: 0,
        activeHabits: 0,
        totalCompletions: 0,
        overallCompletionRate: 0
      };
    }

    return {
      monthlyCompletion: Math.round(overallSummary.overall_completion_rate),
      bestStreak: overallSummary.longest_streak,
      activeHabits: overallSummary.active_habits,
      totalCompletions: overallSummary.total_completions,
      overallCompletionRate: overallSummary.overall_completion_rate
    };
  };

  const stats = calculateStats();

  // Generate weekly data based on current habits
  const generateWeeklyData = () => {
    if (!weeklySummaries || weeklySummaries.length === 0) return [];
    
    return weeklySummaries.map(ws => ({
      week: new Date(ws.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      completion: Math.round(ws.completion_rate)
    }));
  };

  const weeklyData = generateWeeklyData();

  // Get top performing habits
  const getTopHabits = () => {
    if (!topHabits || topHabits.length === 0) return [];
    
    return topHabits.map(habit => ({
      name: habit.habit_name,
      streak: habit.current_streak,
      completion: Math.round(habit.completion_rate)
    }));
  };

  const displayedTopHabits = getTopHabits();

  // Calculate milestones based on real data
  const calculateMilestones = () => {
    const totalHabits = overallSummary?.total_habits || 0;
    const maxStreak = overallSummary?.longest_streak || 0;
    const totalCompletions = overallSummary?.total_completions || 0;
    
    return [
      { 
        title: "First Habit Created", 
        unlocked: totalHabits >= 1, 
        icon: "🎯" 
      },
      { 
        title: "Streak Master", 
        unlocked: maxStreak >= 7, 
        icon: "🔥" 
      },
      { 
        title: "Consistency King", 
        unlocked: totalCompletions >= 21, 
        icon: "👑" 
      },
      { 
        title: "Habit Hero", 
        unlocked: totalHabits >= 5 && maxStreak >= 14, 
        icon: "🦸" 
      },
    ];
  };

  const milestones = calculateMilestones();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading summary data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-poppins font-bold text-foreground">
                  Progress Summary
                </h1>
                <p className="text-sm text-muted-foreground">
                  Track your habit-building journey and celebrate milestones
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-8 max-w-7xl mx-auto">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-soft hover:shadow-medium transition-smooth">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Overall Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">{stats.monthlyCompletion}%</div>
                <p className="text-sm text-muted-foreground">Average completion rate</p>
                <Progress value={stats.monthlyCompletion} className="mt-3 h-2" />
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-medium transition-smooth">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  Longest Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning mb-2">{stats.bestStreak}</div>
                <p className="text-sm text-muted-foreground">Days in a row</p>
                <div className="flex items-center gap-1 mt-3">
                  <Flame className="w-4 h-4 text-warning streak-flame" />
                  <span className="text-sm text-warning font-medium">
                    {stats.bestStreak > 0 ? "Keep it up!" : "Start your streak!"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-medium transition-smooth">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Total Habits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">{stats.activeHabits}</div>
                <p className="text-sm text-muted-foreground">Currently tracking</p>
                <Badge variant="secondary" className="mt-3">
                  All active
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Progress Chart */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="font-poppins text-xl flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-primary" />
                Weekly Progress
              </CardTitle>
              <CardDescription>
                Your completion rates over the past weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={weeklyData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="completion" // Changed from completionRate
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No weekly data available yet. Start tracking habits to see your progress!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Daily Completions Heatmap */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="font-poppins text-xl flex items-center gap-3">
                <Calendar className="w-6 h-6 text-primary" />
                Daily Activity Heatmap
              </CardTitle>
              <CardDescription>
                Your habit completion journey over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse">
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {Array.from({ length: 35 }).map((_, i) => (
                        <div key={i} className="w-8 h-8 bg-gray-200 rounded-md"></div>
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground">Loading your activity...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-red-500 font-medium">Unable to load activity data</p>
                  <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page</p>
                </div>
              ) : dailyCompletions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-10 h-10 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Start Your Journey</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Complete your first habit to see your activity heatmap come to life!
                  </p>
                  <Button onClick={() => navigate('/habits')} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Habit
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Heatmap Legend */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Less</span>
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200"></div>
                        <div className="w-3 h-3 rounded-sm bg-emerald-200 border border-emerald-300"></div>
                        <div className="w-3 h-3 rounded-sm bg-emerald-400 border border-emerald-500"></div>
                        <div className="w-3 h-3 rounded-sm bg-emerald-600 border border-emerald-700"></div>
                        <div className="w-3 h-3 rounded-sm bg-emerald-800 border border-emerald-900"></div>
                      </div>
                      <span>More</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {dailyCompletions.length} days tracked
                    </div>
                  </div>

                  {/* Custom Heatmap Grid */}
                  <div className="space-y-4">
                    {/* Month Labels */}
                    <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground text-center">
                      <div>Sun</div>
                      <div>Mon</div>
                      <div>Tue</div>
                      <div>Wed</div>
                      <div>Thu</div>
                      <div>Fri</div>
                      <div>Sat</div>
                    </div>

                    {/* Heatmap Grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {(() => {
                        const today = new Date();
                        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                        const startOfWeek = new Date(thirtyDaysAgo);
                        startOfWeek.setDate(thirtyDaysAgo.getDate() - thirtyDaysAgo.getDay());
                        
                        const days = [];
                        for (let i = 0; i < 42; i++) {
                          const date = new Date(startOfWeek);
                          date.setDate(startOfWeek.getDate() + i);
                          
                          const dateStr = date.toISOString().split('T')[0];
                          const completion = dailyCompletions.find(d => d.date === dateStr);
                          const count = completion?.count || 0;
                          
                          const isInRange = date >= thirtyDaysAgo && date <= today;
                          const isToday = date.toDateString() === today.toDateString();
                          
                          let bgColor = 'bg-slate-50 border-slate-200';
                          if (isInRange) {
                            if (count === 0) bgColor = 'bg-slate-100 border-slate-200 hover:bg-slate-150';
                            else if (count <= 2) bgColor = 'bg-emerald-200 border-emerald-300 hover:bg-emerald-250';
                            else if (count <= 4) bgColor = 'bg-emerald-400 border-emerald-500 hover:bg-emerald-450';
                            else if (count <= 6) bgColor = 'bg-emerald-600 border-emerald-700 hover:bg-emerald-650';
                            else bgColor = 'bg-emerald-800 border-emerald-900 hover:bg-emerald-850';
                          }
                          
                          days.push(
                            <div
                              key={i}
                              className={`
                                w-8 h-8 rounded-md border-2 transition-all duration-200 cursor-pointer
                                hover:scale-110 hover:shadow-md relative group
                                ${bgColor}
                                ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                                ${!isInRange ? 'opacity-30' : ''}
                              `}
                              title={`${date.toLocaleDateString()}: ${count} completions`}
                            >
                              {isToday && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                              )}
                              
                              {/* Tooltip */}
                              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                                <div className="font-semibold text-center">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                <div className="text-center text-slate-200">{count} completion{count !== 1 ? 's' : ''}</div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                              </div>
                            </div>
                          );
                        }
                        return days;
                      })()
                      }
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {dailyCompletions.reduce((sum, day) => sum + day.count, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Completions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {dailyCompletions.filter(day => day.count > 0).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round((dailyCompletions.filter(day => day.count > 0).length / dailyCompletions.length) * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Consistency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.max(...dailyCompletions.map(day => day.count), 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Best Day</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Per-Habit Statistics */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="font-poppins text-xl flex items-center gap-3">
                <Target className="w-6 h-6 text-primary" />
                Per-Habit Statistics
              </CardTitle>
              <CardDescription>
                Detailed insights into your individual habits
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading habit statistics...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">Error loading habit statistics.</p>
                </div>
              ) : topHabits.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No habits to display statistics for yet.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/add-habit")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Habit
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {topHabits.map((habit) => (
                    <Card key={habit.habit_id} className="shadow-soft hover:shadow-medium transition-smooth">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                          {habit.habit_name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Current Streak</p>
                            <p className="text-xl font-bold text-warning">{habit.current_streak} days</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Longest Streak</p>
                            <p className="text-xl font-bold text-success">{habit.longest_streak} days</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Completions</p>
                            <p className="text-xl font-bold text-primary">{habit.total_completions}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Completion Rate</p>
                            <p className="text-xl font-bold text-info">{Math.round(habit.completion_rate)}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Performing Habits */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="font-poppins text-xl flex items-center gap-3">
                  <Award className="w-6 h-6 text-success" />
                  Top Performing Habits
                </CardTitle>
                <CardDescription>
                  {displayedTopHabits.length === 0 && !loading && !error
                    ? "Create habits to see your top performers" 
                    : "Your most consistent habits"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading top habits...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">Error loading top habits.</p>
                  </div>
                ) : displayedTopHabits.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No habits to analyze yet
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/add-habit")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Habit
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayedTopHabits.map((habit, index) => (
                      <div key={habit.name} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{habit.name}</div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Flame className="w-3 h-3 text-warning" />
                              <span>{habit.streak} day streak</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-success">{habit.completion}%</div>
                          <div className="text-xs text-muted-foreground">completion rate</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="font-poppins text-xl flex items-center gap-3">
                  <Award className="w-6 h-6 text-warning" />
                  Milestones
                </CardTitle>
                <CardDescription>
                  Achievements you've unlocked on your journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <div 
                      key={milestone.title}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-smooth ${
                        milestone.unlocked 
                          ? "bg-success/10 border-success/20" 
                          : "bg-muted/50 border-muted"
                      }`}
                    >
                      <div className="text-2xl">{milestone.icon}</div>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          milestone.unlocked ? "text-success" : "text-muted-foreground"
                        }`}>
                          {milestone.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {milestone.unlocked ? "Unlocked!" : "Keep going to unlock"}
                        </div>
                      </div>
                      {milestone.unlocked && (
                        <Badge variant="secondary" className="bg-success/20 text-success">
                          ✓ Earned
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}