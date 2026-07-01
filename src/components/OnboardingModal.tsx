import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { configuracoesRepo } from '../db/repositories/configuracoesRepo';
import { useLiveQuery } from 'dexie-react-hooks';
import { Target, Apple, BookOpen, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  {
    id: 1,
    title: 'Bem-vindo ao NutriFlow!',
    description: 'Configure seu Perfil para começar. Ajuste seu peso, altura e objetivo para que possamos calcular suas metas diárias perfeitamente.',
    icon: <Target className="w-12 h-12 text-primary" />,
    actionText: 'Próximo',
    route: '/perfil'
  },
  {
    id: 2,
    title: 'Crie seus Alimentos',
    description: 'Você pode cadastrar alimentos personalizados e montar suas próprias receitas para usar no dia a dia de forma rápida.',
    icon: <Apple className="w-12 h-12 text-green-500" />,
    actionText: 'Próximo',
    route: '/alimentos'
  },
  {
    id: 3,
    title: 'Planeje sua Rotina',
    description: 'Use o Diário para registrar o que consumiu hoje, acompanhe sua água, exercícios e suas sequências de sucesso no Dashboard!',
    icon: <BookOpen className="w-12 h-12 text-blue-500" />,
    actionText: 'Começar Agora!',
    route: '/'
  }
];

export function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  // Load the flag from the database
  const onboardingCompleted = useLiveQuery(() => configuracoesRepo.getConfig('onboarding_completed'));

  useEffect(() => {
    if (onboardingCompleted === null) {
      // Finished loading, key doesn't exist
      setOpen(true);
    } else if (onboardingCompleted === 'true') {
      // Finished loading, key exists
      setOpen(false);
    }
    // Se for undefined, está carregando, então não fazemos nada para evitar flash.
  }, [onboardingCompleted]);

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      await configuracoesRepo.setConfig('onboarding_completed', 'true');
      setOpen(false);
      navigate('/');
    }
  };

  const handleSkip = async () => {
    await configuracoesRepo.setConfig('onboarding_completed', 'true');
    setOpen(false);
  };

  const stepData = STEPS[currentStep];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center text-center space-y-4 pt-4">
          <div className="p-4 bg-muted/50 rounded-full">
            {stepData.icon}
          </div>
          <DialogTitle className="text-2xl">{stepData.title}</DialogTitle>
          <DialogDescription className="text-base">
            {stepData.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center gap-2 py-4">
          {STEPS.map((step, index) => (
            <div 
              key={step.id} 
              className={`h-2 rounded-full transition-all duration-300 ${index === currentStep ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'}`}
            />
          ))}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
          <Button variant="ghost" className="w-full sm:w-auto text-muted-foreground" onClick={handleSkip}>
            Pular
          </Button>
          <Button className="w-full sm:w-auto" onClick={handleNext}>
            {currentStep === STEPS.length - 1 ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                {stepData.actionText}
              </>
            ) : (
              <>
                {stepData.actionText}
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
