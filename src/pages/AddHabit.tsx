import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Calendar, Tag, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useHabits } from "@/contexts/HabitContext";

export default function AddHabit() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addHabit } = useHabits();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "Please log in to add a habit.",
      });
      navigate("/login", { replace: true });
    }
  }, [navigate, toast]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    weeklyGoal: 5,
    startDate: new Date().toISOString().split('T')[0],
    tags: [] as string[],
    icon: "🎯"
  });
  
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addHabit({
        name: formData.title, // Backend expects 'name'
        description: formData.description,
        frequency: formData.weeklyGoal.toString(), // Backend expects 'frequency'
      });
      toast({
        title: "Habit created successfully! 🎉",
        description: "Your new habit has been added to your tracker.",
      });
      setFormData({
        title: "",
        description: "",
        weeklyGoal: 5,
        startDate: new Date().toISOString().split('T')[0],
        tags: [],
        icon: "🎯"
      });
      navigate("/habits");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const predefinedIcons = ["🎯", "💪", "📚", "🧘", "💧", "🏃", "🌱", "⭐", "🔥", "✨"];
  const weeklyGoalOptions = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="min-h-screen">
      {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-poppins font-bold text-foreground">
                  Create New Habit
                </h1>
                <p className="text-sm text-muted-foreground">
                  Define a new habit to track and build consistency
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/habits")}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </header>

        <div className="p-6 max-w-2xl mx-auto">
          <Card className="shadow-medium animate-fade-in-up">
            <CardHeader>
              <CardTitle className="font-poppins text-xl flex items-center gap-3">
                <Target className="w-6 h-6 text-primary" />
                Habit Details
              </CardTitle>
              <CardDescription>
                Fill in the information below to create your new habit
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Icon Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Icon</Label>
                  <div className="flex gap-2 flex-wrap">
                    {predefinedIcons.map((icon) => (
                      <Button
                        key={icon}
                        type="button"
                        variant={formData.icon === icon ? "default" : "outline"}
                        size="icon"
                        className="text-lg transition-bounce hover:scale-110"
                        onClick={() => handleInputChange("icon", icon)}
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Habit Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Exercise for 30 minutes"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="transition-smooth focus:shadow-soft"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your habit in more detail..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="transition-smooth focus:shadow-soft"
                    rows={3}
                  />
                </div>

                {/* Weekly Goal */}
                <div className="space-y-2">
                  <Label htmlFor="weeklyGoal" className="text-sm font-medium">
                    Weekly Goal *
                  </Label>
                  <Select
                    value={formData.weeklyGoal.toString()}
                    onValueChange={(value) => handleInputChange("weeklyGoal", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select days per week" />
                    </SelectTrigger>
                    <SelectContent>
                      {weeklyGoalOptions.map((days) => (
                        <SelectItem key={days} value={days.toString()}>
                          {days} day{days !== 1 ? "s" : ""} per week
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium">
                    Start Date
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                      className="pl-10 transition-smooth focus:shadow-soft"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Add a tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        className="pl-10"
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={addTag}
                      disabled={!newTag.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {formData.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-smooth"
                          onClick={() => removeTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6">
                  <Button 
                    type="submit" 
                    variant="hero" 
                    size="lg" 
                    className="flex-1"
                    disabled={loading || !formData.title.trim()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Creating Habit..." : "Create Habit"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigate("/habits")}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
    </div>
  );
}