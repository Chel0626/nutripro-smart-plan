import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { MacroCalculatorStep } from "./steps/MacroCalculatorStep";
import { MealDistributionStep } from "./steps/MealDistributionStep";
import { FineAdjustmentStep } from "./steps/FineAdjustmentStep";
import { PrescriptionStep } from "./steps/PrescriptionStep";
import { Capacitor } from "@capacitor/core";

export interface MacroData {
  totalCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface MealTarget {
  id: string;
  type: "large" | "small";
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface PatientData {
  height: number;
  weight: number;
  age: number;
  gender: "Male" | "Female";
  activityLevel: "Sedentary" | "Lightly Active" | "Moderately Active" | "Very Active";
  goal: "Lose Fat" | "Maintain Weight" | "Gain Muscle";
}

const STEPS = [
  { id: 1, title: "Calculadora de Macros", description: "Calcule as necessidades calóricas" },
  { id: 2, title: "Distribuição de Refeições", description: "Defina quantidade de refeições" },
  { id: 3, title: "Ajuste Fino", description: "Ajuste os valores por refeição" },
  { id: 4, title: "Prescrição Inteligente", description: "IA sugere alimentos" },
];

// Detecta se está rodando como app nativo (APK)
const isNativeApp = Capacitor.isNativePlatform();

// Filtra os passos baseado na plataforma
const getAvailableSteps = () => {
  if (isNativeApp) {
    // Remove o passo 4 (Prescrição Inteligente) quando for APK
    return STEPS.filter(step => step.id !== 4);
  }
  return STEPS;
};

export const DietWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [macroData, setMacroData] = useState<MacroData | null>(null);
  const [mealTargets, setMealTargets] = useState<MealTarget[]>([]);

  const availableSteps = getAvailableSteps();
  const maxStep = Math.max(...availableSteps.map(s => s.id));

  // Scroll para o topo sempre que mudar de step
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const canProgress = () => {
    switch (currentStep) {
      case 1:
        return macroData !== null;
      case 2:
        return mealTargets.length > 0;
      case 3:
        return mealTargets.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canProgress() && currentStep < maxStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/20 to-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            NutriPro
          </h1>
          <p className="text-muted-foreground">Assistente Inteligente de Prescrição Dietética</p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-border -z-10">
              <div
                className="h-full bg-gradient-primary transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (availableSteps.length - 1)) * 100}%` }}
              />
            </div>

            {availableSteps.map((step, index) => (
              <div
                key={step.id}
                className="flex flex-col items-center relative bg-background px-2"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    currentStep >= step.id
                      ? "bg-gradient-primary text-primary-foreground shadow-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-muted-foreground hidden md:block">
                    {step.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-6 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          {currentStep === 1 && (
            <MacroCalculatorStep
              onComplete={(data, macros) => {
                setPatientData(data);
                setMacroData(macros);
              }}
              initialData={patientData}
              initialMacros={macroData}
            />
          )}

          {currentStep === 2 && macroData && (
            <MealDistributionStep
              macroData={macroData}
              onComplete={(targets) => setMealTargets(targets)}
              initialTargets={mealTargets}
            />
          )}

          {currentStep === 3 && (
            <FineAdjustmentStep
              mealTargets={mealTargets}
              onUpdate={(targets) => setMealTargets(targets)}
              totalMacros={macroData!}
            />
          )}

          {currentStep === 4 && (
            <PrescriptionStep
              mealTargets={mealTargets}
              patientData={patientData!}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>

            {currentStep < maxStep ? (
              <Button
                onClick={handleNext}
                disabled={!canProgress()}
                className="gap-2 bg-gradient-primary hover:opacity-90"
              >
                Avançar
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
};
