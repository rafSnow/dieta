import { Card, CardContent } from '../../components/ui/card';

interface ResumoMacrosProps {
  totais: {
    calorias: number;
    proteina: number;
    carboidrato: number;
    gordura: number;
  };
  metas: {
    calorias: number;
    proteina: number;
    carboidrato: number;
    gordura: number;
  };
}

export function ResumoMacros({ totais, metas }: ResumoMacrosProps) {
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
      <MacroCard title="Calorias" atual={totais.calorias} meta={metas.calorias} unit="kcal" color="bg-blue-500" />
      <MacroCard title="Proteínas" atual={totais.proteina} meta={metas.proteina} unit="g" color="bg-red-500" />
      <MacroCard title="Carboidratos" atual={totais.carboidrato} meta={metas.carboidrato} unit="g" color="bg-green-500" />
      <MacroCard title="Gorduras" atual={totais.gordura} meta={metas.gordura} unit="g" color="bg-yellow-500" />
    </div>
  );
}

function MacroCard({ title, atual, meta, unit, color }: { title: string; atual: number; meta: number; unit: string; color: string }) {
  const percent = Math.min(100, Math.round((atual / meta) * 100)) || 0;
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm font-medium text-muted-foreground mb-1">{title}</div>
        <div className="text-2xl font-bold mb-2">
          {Math.round(atual)} <span className="text-sm font-normal text-muted-foreground">/ {meta}{unit}</span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}
