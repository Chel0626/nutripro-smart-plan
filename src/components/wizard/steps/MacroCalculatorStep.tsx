import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp } from "lucide-react";
import type { PatientData, MacroData } from "../DietWizard";

interface MacroCalculatorStepProps {
  onComplete: (patientData: PatientData, macroData: MacroData) => void;
  initialData: PatientData | null;
  initialMacros: MacroData | null;
}

export const MacroCalculatorStep = ({ onComplete, initialData, initialMacros }: MacroCalculatorStepProps) => {
  const [formData, setFormData] = useState<PatientData>(
    initialData || {
      height: 0,
      weight: 0,
      age: 0,
      gender: "Male",
      activityLevel: "Moderately Active",
      goal: "Maintain Weight",
    }
  );

  const [macros, setMacros] = useState<MacroData | null>(initialMacros);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateMacros = () => {
    setIsCalculating(true);

    // Fórmula de Mifflin-St Jeor para TMB
    let bmr: number;
    if (formData.gender === "Male") {
      bmr = 10 * formData.weight + 6.25 * formData.height - 5 * formData.age + 5;
    } else if (formData.gender === "Female") {
      bmr = 10 * formData.weight + 6.25 * formData.height - 5 * formData.age - 161;
    } else {
      // Criança: fórmula simplificada baseada em peso e altura
      bmr = 10 * formData.weight + 6.25 * formData.height - 5 * formData.age + 5;
    }

    // Multiplicadores de atividade
    const activityMultipliers = {
      "Sedentary": 1.2,
      "Lightly Active": 1.375,
      "Moderately Active": 1.55,
      "Very Active": 1.725,
    };

    let tdee = bmr * activityMultipliers[formData.activityLevel];

    // Ajuste por objetivo
    const goalAdjustments = {
      "Lose Fat": 0.8,
      "Maintain Weight": 1.0,
      "Gain Muscle": 1.15,
    };

    const totalCalories = Math.round(tdee * goalAdjustments[formData.goal]);

    // Distribuição de macros (30% proteína, 40% carbo, 30% gordura)
    const proteinGrams = Math.round((totalCalories * 0.3) / 4);
    const carbsGrams = Math.round((totalCalories * 0.4) / 4);
    const fatGrams = Math.round((totalCalories * 0.3) / 9);

    const calculatedMacros: MacroData = {
      totalCalories,
      proteinGrams,
      carbsGrams,
      fatGrams,
    };

    setTimeout(() => {
      setMacros(calculatedMacros);
      onComplete(formData, calculatedMacros);
      setIsCalculating(false);
    }, 800);
  };

  const handleInputChange = (field: keyof PatientData, value: any) => {
    setFormData({ ...formData, [field]: value });
    setMacros(null); // Reset macros when form changes
  };

  const isFormValid = () => {
    return formData.height > 0 && formData.weight > 0 && formData.age > 0;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Calculator className="w-6 h-6 text-primary" />
          Calculadora de Macronutrientes
        </h2>
        <p className="text-muted-foreground mt-2">
          Preencha os dados do paciente para calcular as necessidades calóricas
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Coluna 1: Dados Antropométricos */}
        <Card className="p-4 bg-gradient-card border-primary/20">
          <h3 className="font-semibold mb-4 text-primary">Dados Antropométricos</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="170"
                value={formData.height || ""}
                onChange={(e) => handleInputChange("height", parseFloat(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="70"
                value={formData.weight || ""}
                onChange={(e) => handleInputChange("weight", parseFloat(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="age">Idade (anos)</Label>
              <Input
                id="age"
                type="number"
                placeholder="30"
                value={formData.age || ""}
                onChange={(e) => handleInputChange("age", parseInt(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="gender">Sexo</Label>
              <Select value={formData.gender} onValueChange={(v) => handleInputChange("gender", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Masculino</SelectItem>
                  <SelectItem value="Female">Feminino</SelectItem>
                  <SelectItem value="Child">Criança</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Coluna 2: Nível de Atividade e Objetivo */}
        <Card className="p-4 bg-gradient-card border-primary/20">
          <h3 className="font-semibold mb-4 text-primary">Perfil do Paciente</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="activity">Nível de Atividade</Label>
              <Select value={formData.activityLevel} onValueChange={(v) => handleInputChange("activityLevel", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sedentary">Sedentário</SelectItem>
                  <SelectItem value="Lightly Active">Levemente Ativo</SelectItem>
                  <SelectItem value="Moderately Active">Moderadamente Ativo</SelectItem>
                  <SelectItem value="Very Active">Muito Ativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="goal">Objetivo</Label>
              <Select value={formData.goal} onValueChange={(v) => handleInputChange("goal", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lose Fat">Perder Gordura</SelectItem>
                  <SelectItem value="Maintain Weight">Manter Peso</SelectItem>
                  <SelectItem value="Gain Muscle">Ganhar Massa Muscular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={calculateMacros}
              disabled={!isFormValid() || isCalculating}
              className="w-full mt-6 bg-gradient-primary hover:opacity-90"
            >
              {isCalculating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Calculando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Calcular Macros
                </span>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Resultados */}
      {macros && (
        <Card className="p-6 bg-success-light border-success animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-success" />
            <h3 className="font-semibold text-success">Resultados Calculados</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-card rounded-lg">
              <div className="text-3xl font-bold text-primary">{macros.totalCalories}</div>
              <div className="text-sm text-muted-foreground mt-1">Calorias Totais</div>
            </div>

            <div className="text-center p-4 bg-card rounded-lg">
              <div className="text-3xl font-bold text-info">{macros.proteinGrams}g</div>
              <div className="text-sm text-muted-foreground mt-1">Proteínas</div>
            </div>

            <div className="text-center p-4 bg-card rounded-lg">
              <div className="text-3xl font-bold text-warning">{macros.carbsGrams}g</div>
              <div className="text-sm text-muted-foreground mt-1">Carboidratos</div>
            </div>

            <div className="text-center p-4 bg-card rounded-lg">
              <div className="text-3xl font-bold text-accent">{macros.fatGrams}g</div>
              <div className="text-sm text-muted-foreground mt-1">Gorduras</div>
            </div>
          </div>

          <Button
            className="mt-4 w-full sm:w-auto"
            variant="outline"
            onClick={() => {
              // Monta o texto do relatório
              const bmr = formData.gender === "Male"
                ? 10 * formData.weight + 6.25 * formData.height - 5 * formData.age + 5
                : formData.gender === "Female"
                ? 10 * formData.weight + 6.25 * formData.height - 5 * formData.age - 161
                : 10 * formData.weight + 6.25 * formData.height - 5 * formData.age + 5;
              const activityMultipliers = {
                "Sedentary": 1.2,
                "Lightly Active": 1.375,
                "Moderately Active": 1.55,
                "Very Active": 1.725,
              };
              const activityFactor = activityMultipliers[formData.activityLevel];
              const tdee = bmr * activityFactor;
              const goalAdjustments = {
                "Lose Fat": 0.8,
                "Maintain Weight": 1.0,
                "Gain Muscle": 1.15,
              };
              const goalFactor = goalAdjustments[formData.goal];
              const maintenanceCalories = Math.round(tdee);
              const goalCalories = Math.round(tdee * goalFactor);

              const report =
                `Taxa Metabólica Basal: ${bmr.toFixed(2)} kcal\n` +
                `Fator de Atividade: ${activityFactor} (${formData.activityLevel})\n` +
                `Calorias para Manutenção: ${maintenanceCalories} kcal\n` +
                `Meta para o Objetivo: ${goalCalories} kcal (${formData.goal})\n` +
                `\n` +
                `Proteínas: ${macros.proteinGrams}g\n` +
                `Carboidratos: ${macros.carbsGrams}g\n` +
                `Gorduras: ${macros.fatGrams}g\n`;

              // Salva no localStorage
              localStorage.setItem("nutripro_macro_report", report);

              // Salva como arquivo de texto
              const blob = new Blob([report], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "resultado_macros.txt";
              document.body.appendChild(a);
              a.click();
              setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }, 100);
            }}
          >
            Salvar Resultado em Arquivo
          </Button>
        </Card>
      )}
    </div>
  );
};
