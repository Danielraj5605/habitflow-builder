import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2, Filter, Flame, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useHabits } from "@/contexts/HabitContext";
import EditHabitDialog from "@/components/EditHabitDialog";

export default function HabitTracker() {
  const navigate = useNavigate();
  const { habits, toggleHabitDay, deleteHabit } = useHabits();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "archived">("all");
  const [editingHabitId, setEditingHabitId] = useState<number | null>(null);
  const [deletingHabitId, setDeletingHabitId] = useState<number | null>(null);
  
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleDeleteHabit = () => {
    if (deletingHabitId) {
      deleteHabit(deletingHabitId);
      toast({
        title: "Habit deleted",
        description: "The habit has been removed from your tracker.",
      });
      setDeletingHabitId(null);
    }
  };

  const getCompletionPercentage = (currentWeek: boolean[], weeklyGoal: number) => {
    const completed = currentWeek.filter(Boolean).length;
    return Math.round((completed / weeklyGoal) * 100);
  };

  const filteredHabits = habits.filter(habit => {
    const matchesSearch = habit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         habit.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    switch (filter) {
      case "active":
        return matchesSearch && habit.isActive;
      case "completed":
        const completed = habit.currentWeek.filter(Boolean).length;
        return matchesSearch && completed >= habit.weeklyGoal;
      case "archived":
        return matchesSearch && !habit.isActive;
      default:
        return matchesSearch;
    }
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-poppins font-bold text-foreground">
                  Habit Tracker
                </h1>
                <p className="text-sm text-muted-foreground">
                  Monitor your daily progress and build consistency
                </p>
              </div>
            </div>
            <Button 
              variant="floating" 
              size="icon"
              onClick={() => navigate("/add-habit")}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          {/* Search and Filters */}
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search habits or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {["all", "active", "completed", "archived"].map((filterType) => (
                    <Button
                      key={filterType}
                      variant={filter === filterType ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter(filterType as typeof filter)}
                      className="capitalize"
                    >
                      {filterType}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Habits Grid */}
          <div className="grid gap-6">
            {filteredHabits.map((habit) => {
              const completionPercentage = getCompletionPercentage(habit.currentWeek, habit.weeklyGoal);
              const completedDays = habit.currentWeek.filter(Boolean).length;
              
              return (
                <Card key={habit.id} className="shadow-medium hover:shadow-glow transition-smooth">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg">{habit.icon}</span>
                          <CardTitle className="font-poppins text-lg">{habit.title}</CardTitle>
                          <div className="flex items-center gap-1 text-warning">
                            <Flame className="w-4 h-4 streak-flame" />
                            <span className="text-sm font-medium">{habit.streak}</span>
                          </div>
                        </div>
                        <CardDescription>{habit.description}</CardDescription>
                        <div className="flex gap-2 mt-3">
                          {habit.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setEditingHabitId(habit.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => setDeletingHabitId(habit.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Progress: {completedDays}/{habit.weeklyGoal} days
                        </span>
                        <span className="text-sm font-bold text-primary">
                          {completionPercentage}%
                        </span>
                      </div>
                      <Progress value={completionPercentage} className="h-2" />
                    </div>

                    {/* Week Days */}
                    <div className="grid grid-cols-7 gap-2">
                      {daysOfWeek.map((day, index) => (
                        <div key={day} className="text-center">
                          <div className="text-xs text-muted-foreground mb-2 font-medium">
                            {day}
                          </div>
                          <Button
                            variant={habit.currentWeek[index] ? "success" : "outline"}
                            size="icon"
                            className={`h-10 w-full transition-bounce ${
                              habit.currentWeek[index] ? "habit-complete" : "border-2 border-gray-300 dark:border-gray-700"
                            }`}
                            onClick={() => toggleHabitDay(habit.id, index)}
                          >
                            {habit.currentWeek[index] && "✓"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredHabits.length === 0 && (
            <Card className="shadow-soft">
              <CardContent className="p-12 text-center">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No habits found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Try adjusting your search or filters" 
                    : "Start building better habits by creating your first one"}
                </p>
                <Button 
                  variant="hero"
                  onClick={() => navigate("/add-habit")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Habit
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Dialog */}
        <EditHabitDialog
          habitId={editingHabitId}
          open={!!editingHabitId}
          onOpenChange={(open) => !open && setEditingHabitId(null)}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingHabitId} onOpenChange={(open) => !open && setDeletingHabitId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Habit</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this habit? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteHabit}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}