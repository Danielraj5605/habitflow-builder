import { useState, useEffect } from "react";
import { Target, Calendar, Tag, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useHabits } from "@/contexts/HabitContext";

interface EditHabitDialogProps {
  habitId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditHabitDialog({ habitId, open, onOpenChange }: EditHabitDialogProps) {
  const { toast } = useToast();
  const { getHabitById, updateHabit } = useHabits();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    weeklyGoal: 5,
    startDate: "",
    tags: [] as string[],
    icon: "🎯"
  });
  
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (habitId && open) {
      const habit = getHabitById(habitId);
      if (habit) {
        setFormData({
          title: habit.title,
          description: habit.description,
          weeklyGoal: habit.weeklyGoal,
          startDate: habit.created_at?.split('T')[0] || '',
          tags: habit.tags,
          icon: habit.icon,
        });
      }
    }
  }, [habitId, open, getHabitById]);

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
    if (!habitId) return;
    
    setLoading(true);

    updateHabit(habitId, {
      title: formData.title,
      name: formData.title, // Backend expects 'name' field
      description: formData.description,
      weeklyGoal: formData.weeklyGoal,
      tags: formData.tags,
      icon: formData.icon,
    });

    setTimeout(() => {
      toast({
        title: "Habit updated successfully! ✨",
        description: "Your habit changes have been saved.",
      });
      onOpenChange(false);
      setLoading(false);
    }, 500);
  };

  const predefinedIcons = ["🎯", "💪", "📚", "🧘", "💧", "🏃", "🌱", "⭐", "🔥", "✨"];
  const weeklyGoalOptions = [1, 2, 3, 4, 5, 6, 7];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-poppins text-xl flex items-center gap-3">
            <Target className="w-6 h-6 text-primary" />
            Edit Habit
          </DialogTitle>
          <DialogDescription>
            Update your habit details below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <Label htmlFor="edit-title" className="text-sm font-medium">
              Habit Title *
            </Label>
            <Input
              id="edit-title"
              placeholder="e.g., Exercise for 30 minutes"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="transition-smooth focus:shadow-soft"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="edit-description"
              placeholder="Describe your habit in more detail..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="transition-smooth focus:shadow-soft"
              rows={3}
            />
          </div>

          {/* Weekly Goal */}
          <div className="space-y-2">
            <Label htmlFor="edit-weeklyGoal" className="text-sm font-medium">
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
            <Label htmlFor="edit-startDate" className="text-sm font-medium">
              Start Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-startDate"
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="lg"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}