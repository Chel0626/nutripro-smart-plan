import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Coffee, Pizza } from "lucide-react";
import type { MacroData, MealTarget } from "../DietWizard";

interface MealDistributionStepProps {
  macroData: MacroData;
  onComplete: (targets: MealTarget[]) => void;
  initialTargets: MealTarget[];
}

export const MealDistributionStep = ({ macroData, onComplete, initialTargets }: MealDistributionStepProps) => {
  const [largeMeals, setLargeMeals] = useState(initialTargets.length > 0 ? initialTargets.filter(m => m.type === "large").length : 3);
  const [smallMeals, setSmallMeals] = useState(initialTargets.length > 0 ? initialTargets.filter(m => m.type === "small").length : 2);
  const [distribution, setDistribution] = useState<MealTarget[]>(initialTargets);

  const calculateDistribution = () => {
    const totalMeals = largeMeals + smallMeals;
    
    // Refeições grandes recebem 70% das calorias totais
    const largePortionCalories = (macroData.totalCalories * 0.7) / largeMeals;
    const smallPortionCalories = (macroData.totalCalories * 0.3) / smallMeals;

    const targets: MealTarget[] = [];

    // Refeições grandes
    for (let i = 0; i < largeMeals; i++) {
      const mealNames = ["Café da Manhã", "Almoço", "Jantar", "Refeição 4", "Refeição 5"];
      targets.push({
        id: `large-${i}`,
        type: "large",
        name: mealNames[i] || `Refeição Grande ${i + 1}`,
        calories: Math.round(largePortionCalories),
        protein: Math.round((largePortionCalories * 0.3) / 4),
        carbs: Math.round((largePortionCalories * 0.4) / 4),
        fat: Math.round((largePortionCalories * 0.3) / 9),
      });
    }

    // Refeições pequenas (lanches)
    for (let i = 0; i < smallMeals; i++) {
      targets.push({
        id: `small-${i}`,
        type: "small",
        name: `Lanche ${i + 1}`,
        calories: Math.round(smallPortionCalories),
        protein: Math.round((smallPortionCalories * 0.3) / 4),
        carbs: Math.round((smallPortionCalories * 0.4) / 4),
        fat: Math.round((smallPortionCalories * 0.3) / 9),
      });
    }

    setDistribution(targets);
    onComplete(targets);
  };

  const isValid = largeMeals > 0 || smallMeals > 0;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <UtensilsCrossed className="w-6 h-6 text-primary" />
          Distribuição de Refeições
        </h2>
        <p className="text-muted-foreground mt-2">
          Defina quantas refeições grandes e pequenas o paciente fará por dia
        </p>
      </div>

      {/* Summary Card */}
      <Card className="p-4 bg-primary-light border-primary/30">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-2">Meta Diária Total</div>
          <div className="text-3xl font-bold text-primary">{macroData.totalCalories} kcal</div>
          <div className="flex justify-center gap-6 mt-3 text-sm">
            <span className="text-info">PTN: {macroData.proteinGrams}g</span>
            <span className="text-warning">CARB: {macroData.carbsGrams}g</span>
            <span className="text-accent">GOR: {macroData.fatGrams}g</span>
          </div>
        </div>
      </Card>

      {/* Meal Configuration */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <Pizza className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold">Refeições Grandes</h3>
              <p className="text-sm text-muted-foreground">70% das calorias totais</p>
            </div>
          </div>
          
          <Label htmlFor="large-meals">Quantidade</Label>
          <Input
            id="large-meals"
            type="number"
            min="0"
            max="6"
            value={largeMeals}
            onChange={(e) => {
              setLargeMeals(parseInt(e.target.value) || 0);
              setDistribution([]);
            }}
            className="mt-2 text-lg font-semibold"
          />
        </Card>

        <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <Coffee className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold">Refeições Pequenas (Lanches)</h3>
              <p className="text-sm text-muted-foreground">30% das calorias totais</p>
            </div>
          </div>
          
          <Label htmlFor="small-meals">Quantidade</Label>
          <Input
            id="small-meals"
            type="number"
            min="0"
            max="6"
            value={smallMeals}
            onChange={(e) => {
              setSmallMeals(parseInt(e.target.value) || 0);
              setDistribution([]);
            }}
            className="mt-2 text-lg font-semibold"
          />
        </Card>
      </div>

      <Button
        onClick={calculateDistribution}
        disabled={!isValid}
        className="w-full bg-gradient-primary hover:opacity-90"
      >
        Calcular Distribuição
      </Button>

      {/* Distribution Preview */}
      {distribution.length > 0 && (
        <Card className="p-6 bg-success-light border-success animate-in fade-in slide-in-from-bottom-4">
          <h3 className="font-semibold mb-4 text-success">Distribuição Calculada</h3>
          
          <div className="space-y-3">
            {distribution.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center justify-between p-3 bg-card rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {meal.type === "large" ? (
                    <Pizza className="w-5 h-5 text-primary" />
                  ) : (
                    <Coffee className="w-5 h-5 text-primary" />
                  )}
                  <span className="font-medium">{meal.name}</span>
                </div>
                
                <div className="flex gap-4 text-sm">
                  <span className="font-semibold">{meal.calories} kcal</span>
                  <span className="text-info">{meal.protein}g PTN</span>
                  <span className="text-warning">{meal.carbs}g CARB</span>
                  <span className="text-accent">{meal.fat}g GOR</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
