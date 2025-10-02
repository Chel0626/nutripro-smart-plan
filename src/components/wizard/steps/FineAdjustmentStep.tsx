import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Settings2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { MealTarget, MacroData } from "../DietWizard";

interface FineAdjustmentStepProps {
  mealTargets: MealTarget[];
  onUpdate: (targets: MealTarget[]) => void;
  totalMacros: MacroData;
}

export const FineAdjustmentStep = ({ mealTargets, onUpdate, totalMacros }: FineAdjustmentStepProps) => {
  const [targets, setTargets] = useState<MealTarget[]>(mealTargets);
  const [autoRedistribute, setAutoRedistribute] = useState(true);
  const [currentTotals, setCurrentTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  useEffect(() => {
    calculateTotals();
    onUpdate(targets);
  }, [targets]);

  const calculateTotals = () => {
    const totals = targets.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    setCurrentTotals(totals);
  };

  const handleCaloriesChange = (mealId: string, newCalories: number) => {
    const updatedTargets = [...targets];
    const mealIndex = updatedTargets.findIndex((m) => m.id === mealId);
    const meal = updatedTargets[mealIndex];
    const oldCalories = meal.calories;
    const difference = newCalories - oldCalories;

    // Atualiza a refeição atual
    meal.calories = newCalories;
    meal.protein = Math.round((newCalories * 0.3) / 4);
    meal.carbs = Math.round((newCalories * 0.4) / 4);
    meal.fat = Math.round((newCalories * 0.3) / 9);

    // Se redistribuição automática está ativa
    if (autoRedistribute && difference !== 0) {
      const sameMealType = updatedTargets.filter(
        (m) => m.type === meal.type && m.id !== mealId
      );

      if (sameMealType.length > 0) {
        const redistributedDiff = Math.round(difference / sameMealType.length);

        sameMealType.forEach((otherMeal) => {
          const adjustedCalories = Math.max(100, otherMeal.calories - redistributedDiff);
          otherMeal.calories = adjustedCalories;
          otherMeal.protein = Math.round((adjustedCalories * 0.3) / 4);
          otherMeal.carbs = Math.round((adjustedCalories * 0.4) / 4);
          otherMeal.fat = Math.round((adjustedCalories * 0.3) / 9);
        });
      }
    }

    setTargets(updatedTargets);
  };

  const getDifference = (current: number, target: number) => {
    const diff = current - target;
    const percentage = ((diff / target) * 100).toFixed(1);
    return { diff, percentage, isOff: Math.abs(diff) > target * 0.05 };
  };

  const caloriesDiff = getDifference(currentTotals.calories, totalMacros.totalCalories);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Settings2 className="w-6 h-6 text-primary" />
          Ajuste Fino da Distribuição
        </h2>
        <p className="text-muted-foreground mt-2">
          Ajuste as calorias de cada refeição conforme necessário
        </p>
      </div>

      {/* Summary Status */}
      <Card className={`p-4 ${caloriesDiff.isOff ? "bg-warning/10 border-warning" : "bg-success-light border-success"}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Total Atual vs Meta</div>
            <div className="text-2xl font-bold">
              {currentTotals.calories} / {totalMacros.totalCalories} kcal
            </div>
          </div>
          
          <div className="text-right">
            {caloriesDiff.isOff ? (
              <span className="text-warning font-semibold">
                {caloriesDiff.diff > 0 ? "+" : ""}{caloriesDiff.diff} kcal ({caloriesDiff.percentage}%)
              </span>
            ) : (
              <span className="text-success font-semibold">✓ Dentro da meta</span>
            )}
          </div>
        </div>
      </Card>

      {/* Auto-redistribution Toggle */}
      <Card className="p-4 bg-primary-light border-primary/30">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto-redistribute" className="font-semibold">
              Redistribuição Automática
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Quando ativa, ao aumentar calorias de uma refeição, as outras do mesmo tipo são reduzidas automaticamente
            </p>
          </div>
          <Switch
            id="auto-redistribute"
            checked={autoRedistribute}
            onCheckedChange={setAutoRedistribute}
          />
        </div>
      </Card>

      {/* Meal Adjustments */}
      <div className="space-y-3">
        {targets.map((meal) => (
          <Card key={meal.id} className="p-4 hover:border-primary/40 transition-colors">
            <div className="grid md:grid-cols-2 gap-4 items-center">
              <div>
                <div className="font-semibold">{meal.name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  PTN: {meal.protein}g • CARB: {meal.carbs}g • GOR: {meal.fat}g
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor={`calories-${meal.id}`} className="text-sm">
                    Calorias
                  </Label>
                  <Input
                    id={`calories-${meal.id}`}
                    type="number"
                    value={meal.calories}
                    onChange={(e) => handleCaloriesChange(meal.id, parseInt(e.target.value) || 0)}
                    className="mt-1"
                    min="0"
                  />
                </div>
                <div className="text-right pt-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    meal.type === "large" 
                      ? "bg-primary/20 text-primary" 
                      : "bg-info/20 text-info"
                  }`}>
                    {meal.type === "large" ? "Grande" : "Lanche"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Warning if off target */}
      {caloriesDiff.isOff && (
        <Alert className="border-warning bg-warning/10">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning">
            O total de calorias atual difere da meta em {Math.abs(caloriesDiff.diff)} kcal.
            Ajuste as refeições para alcançar o valor desejado.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
