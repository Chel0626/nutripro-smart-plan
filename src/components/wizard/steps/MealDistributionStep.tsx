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
  const [largePercentage, setLargePercentage] = useState(70);
  const [smallPercentage, setSmallPercentage] = useState(30);
  const [proteinPercent, setProteinPercent] = useState(20);
  const [carbsPercent, setCarbsPercent] = useState(45);
  const [fatPercent, setFatPercent] = useState(35);
  const [distribution, setDistribution] = useState<MealTarget[]>(initialTargets);

  const calculateDistribution = () => {
    const totalMeals = largeMeals + smallMeals;
    
    // Usa as porcentagens definidas pelo usuário
    const largePortionCalories = (macroData.totalCalories * (largePercentage / 100)) / largeMeals;
    const smallPortionCalories = (macroData.totalCalories * (smallPercentage / 100)) / smallMeals;

    const targets: MealTarget[] = [];

    // Refeições grandes
    for (let i = 0; i < largeMeals; i++) {
      const mealNames = ["Café da Manhã", "Almoço", "Jantar", "Refeição 4", "Refeição 5"];
      targets.push({
        id: `large-${i}`,
        type: "large",
        name: mealNames[i] || `Refeição Grande ${i + 1}`,
        calories: Math.round(largePortionCalories),
        protein: Math.round((largePortionCalories * (proteinPercent / 100)) / 4),
        carbs: Math.round((largePortionCalories * (carbsPercent / 100)) / 4),
        fat: Math.round((largePortionCalories * (fatPercent / 100)) / 9),
      });
    }

    // Refeições pequenas (lanches)
    for (let i = 0; i < smallMeals; i++) {
      targets.push({
        id: `small-${i}`,
        type: "small",
        name: `Lanche ${i + 1}`,
        calories: Math.round(smallPortionCalories),
        protein: Math.round((smallPortionCalories * (proteinPercent / 100)) / 4),
        carbs: Math.round((smallPortionCalories * (carbsPercent / 100)) / 4),
        fat: Math.round((smallPortionCalories * (fatPercent / 100)) / 9),
      });
    }

    setDistribution(targets);
    onComplete(targets);
  };

  const isValid = (largeMeals > 0 || smallMeals > 0) && (largePercentage + smallPercentage === 100) && (proteinPercent + carbsPercent + fatPercent === 100);

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
              <p className="text-sm text-muted-foreground">{largePercentage}% das calorias totais</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
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
            </div>
            
            <div>
              <Label htmlFor="large-percentage">Porcentagem das Calorias</Label>
              <Input
                id="large-percentage"
                type="number"
                min="0"
                max="100"
                value={largePercentage}
                onChange={(e) => {
                  let value = parseInt(e.target.value) || 0;
                  if (value > 100) value = 100;
                  if (value < 0) value = 0;
                  setLargePercentage(value);
                  setSmallPercentage(100 - value);
                  setDistribution([]);
                }}
                className="mt-2 text-lg font-semibold"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <Coffee className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold">Refeições Pequenas (Lanches)</h3>
              <p className="text-sm text-muted-foreground">{smallPercentage}% das calorias totais</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
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
            </div>
            
            <div>
              <Label htmlFor="small-percentage">Porcentagem das Calorias</Label>
              <Input
                id="small-percentage"
                type="number"
                min="0"
                max="100"
                value={smallPercentage}
                onChange={(e) => {
                  let value = parseInt(e.target.value) || 0;
                  if (value > 100) value = 100;
                  if (value < 0) value = 0;
                  setSmallPercentage(value);
                  setLargePercentage(100 - value);
                  setDistribution([]);
                }}
                className="mt-2 text-lg font-semibold"
              />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Macro Distribution */}
      <Card className="p-6 border-primary/20">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-primary" />
          Distribuição de Macronutrientes
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="protein-percent">Proteína (%)</Label>
            <Input
              id="protein-percent"
              type="number"
              min="0"
              max="100"
              value={proteinPercent}
              onChange={(e) => {
                setProteinPercent(parseInt(e.target.value) || 0);
                setDistribution([]);
              }}
              className="mt-2 text-lg font-semibold"
            />
          </div>
          
          <div>
            <Label htmlFor="carbs-percent">Carboidratos (%)</Label>
            <Input
              id="carbs-percent"
              type="number"
              min="0"
              max="100"
              value={carbsPercent}
              onChange={(e) => {
                setCarbsPercent(parseInt(e.target.value) || 0);
                setDistribution([]);
              }}
              className="mt-2 text-lg font-semibold"
            />
          </div>
          
          <div>
            <Label htmlFor="fat-percent">Gorduras (%)</Label>
            <Input
              id="fat-percent"
              type="number"
              min="0"
              max="100"
              value={fatPercent}
              onChange={(e) => {
                setFatPercent(parseInt(e.target.value) || 0);
                setDistribution([]);
              }}
              className="mt-2 text-lg font-semibold"
            />
          </div>
        </div>
        
        {proteinPercent + carbsPercent + fatPercent !== 100 && (
          <div className="text-sm text-destructive mt-3 text-center">
            ⚠️ A soma deve ser 100% (atual: {proteinPercent + carbsPercent + fatPercent}%)
          </div>
        )}
      </Card>
      
      {largePercentage + smallPercentage !== 100 && (
        <div className="text-sm text-destructive text-center">
          ⚠️ A soma das porcentagens de refeições deve ser 100% (atual: {largePercentage + smallPercentage}%)
        </div>
      )}

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
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-card rounded-lg gap-2"
              >
                <div className="flex items-center gap-3">
                  {meal.type === "large" ? (
                    <Pizza className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <Coffee className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                  <span className="font-medium">{meal.name}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 sm:gap-4 text-sm">
                  <span className="font-semibold whitespace-nowrap">{meal.calories} kcal</span>
                  <span className="text-info whitespace-nowrap">PTN {meal.protein}g</span>
                  <span className="text-warning whitespace-nowrap">CHO {meal.carbs}g</span>
                  <span className="text-accent whitespace-nowrap">LPD {meal.fat}g</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
