import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Save, Edit2, Check } from "lucide-react";
import { toast } from "sonner";
import type { MealTarget, PatientData } from "../DietWizard";

interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealPrescription {
  mealId: string;
  mealName: string;
  foods: FoodItem[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface PrescriptionStepProps {
  mealTargets: MealTarget[];
  patientData: PatientData;
}

export const PrescriptionStep = ({ mealTargets, patientData }: PrescriptionStepProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prescriptions, setPrescriptions] = useState<MealPrescription[]>([]);
  const [editingFood, setEditingFood] = useState<string | null>(null);

  // Mock AI suggestion generator
  const generateSuggestions = async () => {
    setIsGenerating(true);
    
    // Simula chamada à API de IA
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Dados mockados de alimentos
    const mockFoods = [
      { name: "Arroz Integral", calories: 110, protein: 2.5, carbs: 23, fat: 0.9, unit: "g" },
      { name: "Frango Grelhado", calories: 165, protein: 31, carbs: 0, fat: 3.6, unit: "g" },
      { name: "Brócolis", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, unit: "g" },
      { name: "Azeite de Oliva", calories: 119, protein: 0, carbs: 0, fat: 13.5, unit: "ml" },
      { name: "Batata Doce", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, unit: "g" },
      { name: "Ovo", calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, unit: "un" },
      { name: "Aveia", calories: 68, protein: 2.4, carbs: 12, fat: 1.4, unit: "g" },
      { name: "Banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, unit: "un" },
    ];

    const generated: MealPrescription[] = mealTargets.map((meal) => {
      // Seleciona alimentos aleatórios
      const selectedFoods: FoodItem[] = [];
      let remainingCalories = meal.calories;
      
      for (let i = 0; i < 3 && remainingCalories > 50; i++) {
        const food = mockFoods[Math.floor(Math.random() * mockFoods.length)];
        const targetQuantity = Math.round((remainingCalories / 3) / (food.calories / 100));
        
        selectedFoods.push({
          id: `${meal.id}-food-${i}`,
          name: food.name,
          quantity: targetQuantity,
          unit: food.unit,
          calories: Math.round((food.calories / 100) * targetQuantity),
          protein: Math.round((food.protein / 100) * targetQuantity),
          carbs: Math.round((food.carbs / 100) * targetQuantity),
          fat: Math.round((food.fat / 100) * targetQuantity),
        });

        remainingCalories -= selectedFoods[i].calories;
      }

      const totals = selectedFoods.reduce(
        (acc, food) => ({
          calories: acc.calories + food.calories,
          protein: acc.protein + food.protein,
          carbs: acc.carbs + food.carbs,
          fat: acc.fat + food.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      return {
        mealId: meal.id,
        mealName: meal.name,
        foods: selectedFoods,
        totals,
      };
    });

    setPrescriptions(generated);
    setIsGenerating(false);
    toast.success("Sugestões geradas com sucesso!");
  };

  const handleQuantityChange = (prescriptionIndex: number, foodId: string, newQuantity: number) => {
    const updated = [...prescriptions];
    const prescription = updated[prescriptionIndex];
    const food = prescription.foods.find(f => f.id === foodId);
    
    if (food) {
      const baseCalories = food.calories / food.quantity;
      food.quantity = newQuantity;
      food.calories = Math.round(baseCalories * newQuantity);
      food.protein = Math.round((food.protein / food.quantity) * newQuantity);
      food.carbs = Math.round((food.carbs / food.quantity) * newQuantity);
      food.fat = Math.round((food.fat / food.quantity) * newQuantity);

      // Recalcula totais
      prescription.totals = prescription.foods.reduce(
        (acc, f) => ({
          calories: acc.calories + f.calories,
          protein: acc.protein + f.protein,
          carbs: acc.carbs + f.carbs,
          fat: acc.fat + f.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      setPrescriptions(updated);
    }
  };

  const handleSave = () => {
    // Aqui você enviaria para a API POST /api/v1/diet-plans/
    console.log("Salvando plano dietético:", {
      patient: patientData,
      prescriptions,
    });
    
    toast.success("Plano dietético salvo com sucesso! 🎉", {
      description: "O plano foi salvo e está pronto para ser compartilhado com o paciente.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Prescrição Inteligente com IA
        </h2>
        <p className="text-muted-foreground mt-2">
          A IA sugere alimentos e quantidades para cada refeição
        </p>
      </div>

      {prescriptions.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Pronto para gerar sugestões?</h3>
          <p className="text-muted-foreground mb-6">
            Nossa IA analisará os alvos de cada refeição e sugerirá alimentos adequados
          </p>
          <Button
            onClick={generateSuggestions}
            disabled={isGenerating}
            className="bg-gradient-primary hover:opacity-90"
            size="lg"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Gerando sugestões...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Gerar Sugestões com IA
              </span>
            )}
          </Button>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {prescriptions.map((prescription, prescIdx) => {
              const targetMeal = mealTargets.find(m => m.id === prescription.mealId);
              const calorieDiff = prescription.totals.calories - (targetMeal?.calories || 0);
              const isOnTarget = Math.abs(calorieDiff) <= (targetMeal?.calories || 0) * 0.1;

              return (
                <Card key={prescription.mealId} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{prescription.mealName}</h3>
                      <div className="text-sm text-muted-foreground mt-1">
                        Meta: {targetMeal?.calories} kcal • Atual: {prescription.totals.calories} kcal
                        {!isOnTarget && (
                          <span className="text-warning ml-2">
                            ({calorieDiff > 0 ? "+" : ""}{calorieDiff} kcal)
                          </span>
                        )}
                      </div>
                    </div>
                    {isOnTarget && (
                      <Check className="w-6 h-6 text-success" />
                    )}
                  </div>

                  <div className="space-y-3">
                    {prescription.foods.map((food) => (
                      <div key={food.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{food.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {food.calories} kcal • PTN: {food.protein}g • CARB: {food.carbs}g • GOR: {food.fat}g
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {editingFood === food.id ? (
                            <>
                              <Input
                                type="number"
                                value={food.quantity}
                                onChange={(e) => handleQuantityChange(prescIdx, food.id, parseInt(e.target.value) || 0)}
                                className="w-20"
                                min="0"
                              />
                              <span className="text-sm text-muted-foreground">{food.unit}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingFood(null)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="font-semibold">{food.quantity} {food.unit}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingFood(food.id)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total da Refeição:</span>
                      <div className="flex gap-4 text-sm">
                        <span className="font-semibold">{prescription.totals.calories} kcal</span>
                        <span className="text-info">{prescription.totals.protein}g PTN</span>
                        <span className="text-warning">{prescription.totals.carbs}g CARB</span>
                        <span className="text-accent">{prescription.totals.fat}g GOR</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="p-6 bg-gradient-primary text-primary-foreground">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Save className="w-5 h-5" />
              Finalizar Prescrição
            </h3>
            <p className="mb-4 opacity-90">
              Revise todas as refeições e salve o plano dietético completo. Você poderá editá-lo posteriormente.
            </p>
            <Button
              onClick={handleSave}
              className="w-full bg-white text-primary hover:bg-white/90"
              size="lg"
            >
              Salvar Plano Dietético Completo
            </Button>
          </Card>
        </>
      )}
    </div>
  );
};
