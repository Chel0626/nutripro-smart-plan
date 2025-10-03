import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

  const handleMacroChange = (mealId: string, macro: 'protein' | 'carbs' | 'fat', newValue: number) => {
    const updatedTargets = [...targets];
    const mealIndex = updatedTargets.findIndex((m) => m.id === mealId);
    const meal = updatedTargets[mealIndex];
    const oldValue = meal[macro];
    const diff = newValue - oldValue;

    meal[macro] = newValue;
    meal.calories = Math.round(meal.protein * 4 + meal.carbs * 4 + meal.fat * 9);

    if (autoRedistribute && diff !== 0) {
      const sameMealType = updatedTargets.filter((m) => m.type === meal.type && m.id !== mealId);
      if (sameMealType.length > 0) {
        const redist = Math.trunc(diff / sameMealType.length);
        sameMealType.forEach((otherMeal, idx) => {
          if (idx === sameMealType.length - 1) {
            otherMeal[macro] -= diff - redist * idx;
          } else {
            otherMeal[macro] -= redist;
          }
          otherMeal.calories = Math.round(otherMeal.protein * 4 + otherMeal.carbs * 4 + otherMeal.fat * 9);
        });
      }
    }
    setTargets(updatedTargets);
  };

  const caloriesDiff = {
    diff: currentTotals.calories - totalMacros.totalCalories,
    percentage: ((currentTotals.calories - totalMacros.totalCalories) / totalMacros.totalCalories * 100).toFixed(1),
    isOff: currentTotals.calories !== totalMacros.totalCalories,
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Settings2 className="w-6 h-6 text-primary" />
          Ajuste Fino da Distribuição
        </h2>
        <p className="text-muted-foreground mt-2">
          Ajuste os macros de cada refeição conforme necessário
        </p>
      </div>

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

      <Card className="p-4 bg-primary-light border-primary/30">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto-redistribute" className="font-semibold">
              Redistribuição Automática
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Quando ativa, ao alterar um macro de uma refeição, as outras do mesmo tipo são ajustadas automaticamente
            </p>
          </div>
          <Switch
            id="auto-redistribute"
            checked={autoRedistribute}
            onCheckedChange={setAutoRedistribute}
          />
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4 border-primary/40">
          <h3 className="font-bold text-primary mb-4 text-lg">Refeições Grandes</h3>
          <div className="space-y-3">
            {targets.filter(m => m.type === "large").map((meal) => (
              <div key={meal.id} className="p-4 bg-primary-light/10 border-primary/20 rounded-lg">
                <div className="mb-3">
                  <div className="font-semibold">{meal.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {meal.calories} kcal
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor={`protein-${meal.id}`} className="text-xs">Proteína (g)</Label>
                    <Input
                      id={`protein-${meal.id}`}
                      type="number"
                      value={meal.protein}
                      min="0"
                      onChange={e => handleMacroChange(meal.id, 'protein', parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`carbs-${meal.id}`} className="text-xs">Carboidrato (g)</Label>
                    <Input
                      id={`carbs-${meal.id}`}
                      type="number"
                      value={meal.carbs}
                      min="0"
                      onChange={e => handleMacroChange(meal.id, 'carbs', parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`fat-${meal.id}`} className="text-xs">Gordura (g)</Label>
                    <Input
                      id={`fat-${meal.id}`}
                      type="number"
                      value={meal.fat}
                      min="0"
                      onChange={e => handleMacroChange(meal.id, 'fat', parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 border-info/40">
          <h3 className="font-bold text-info mb-4 text-lg">Refeições Pequenas (Lanches)</h3>
          <div className="space-y-3">
            {targets.filter(m => m.type === "small").map((meal) => (
              <div key={meal.id} className="p-4 bg-info-light/10 border-info/20 rounded-lg">
                <div className="mb-3">
                  <div className="font-semibold">{meal.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {meal.calories} kcal
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor={`protein-${meal.id}`} className="text-xs">Proteína (g)</Label>
                    <Input
                      id={`protein-${meal.id}`}
                      type="number"
                      value={meal.protein}
                      min="0"
                      onChange={e => handleMacroChange(meal.id, 'protein', parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`carbs-${meal.id}`} className="text-xs">Carboidrato (g)</Label>
                    <Input
                      id={`carbs-${meal.id}`}
                      type="number"
                      value={meal.carbs}
                      min="0"
                      onChange={e => handleMacroChange(meal.id, 'carbs', parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`fat-${meal.id}`} className="text-xs">Gordura (g)</Label>
                    <Input
                      id={`fat-${meal.id}`}
                      type="number"
                      value={meal.fat}
                      min="0"
                      onChange={e => handleMacroChange(meal.id, 'fat', parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

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
