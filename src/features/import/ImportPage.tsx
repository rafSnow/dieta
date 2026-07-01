import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { receitasRepo } from '../../db/repositories/receitasRepo';
import { Download, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { db } from '../../db/database';

export function ImportPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [importData, setImportData] = useState<{ tipo: string, dados: any } | null>(null);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (!dataParam) {
      setError("Nenhum dado de importação fornecido na URL.");
      setLoading(false);
      return;
    }

    try {
      const decodedStr = decodeURIComponent(atob(dataParam));
      const parsedData = JSON.parse(decodedStr);
      setImportData(parsedData);
    } catch (e) {
      setError("Link de importação inválido ou corrompido.");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const handleImport = async () => {
    if (!importData) return;
    
    setLoading(true);
    try {
      if (importData.tipo === 'receita') {
        const { ingredientes, ...receita } = importData.dados;
        delete receita.id;
        await receitasRepo.create(receita, ingredientes || []);
        setSuccess(`Receita "${receita.nome}" importada com sucesso!`);
      } else if (importData.tipo === 'planejamento') {
        const { registros, itens } = importData.dados;
        const hojeStr = format(new Date(), 'yyyy-MM-dd');

        await db.transaction('rw', db.registrosRefeicao, db.itensRegistro, async () => {
          for (const reg of registros) {
            // Verifica se já existe o registro pra hoje
            let currentReg = await db.registrosRefeicao
              .where({ data: hojeStr, tipoRefeicao: reg.tipoRefeicao })
              .first();
            
            if (!currentReg) {
              const newId = await db.registrosRefeicao.add({
                data: hojeStr,
                tipoRefeicao: reg.tipoRefeicao
              });
              currentReg = await db.registrosRefeicao.get(newId);
            }

            if (currentReg && currentReg.id) {
              const itensDestaRefeicao = itens.filter((i: any) => i.registroRefeicaoId === reg.id);
              const novosItens = itensDestaRefeicao.map((item: any) => {
                const newItem = { ...item };
                delete newItem.id;
                newItem.registroRefeicaoId = currentReg!.id!;
                return newItem;
              });
              
              if (novosItens.length > 0) {
                await db.itensRegistro.bulkAdd(novosItens);
              }
            }
          }
        });
        
        setSuccess(`Planejamento Diário importado para o dia de HOJE com sucesso!`);
      }
    } catch (e: any) {
      setError(`Erro ao importar: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center mt-20">Analisando link de compartilhamento...</div>;
  }

  return (
    <div className="container max-w-lg mx-auto p-4 space-y-6 pt-10">
      <Link to="/" className="inline-flex items-center text-sm text-primary hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao Início
      </Link>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            {success ? <CheckCircle className="w-6 h-6 mr-2 text-green-500" /> : 
             error ? <AlertTriangle className="w-6 h-6 mr-2 text-red-500" /> : 
             <Download className="w-6 h-6 mr-2 text-primary" />}
            Importar {importData?.tipo === 'receita' ? 'Receita' : importData?.tipo === 'planejamento' ? 'Planejamento' : 'Dados'}
          </CardTitle>
          <CardDescription>
            {success ? 'Importação finalizada.' : error ? 'Falha na importação.' : 'Você recebeu um link de compartilhamento do NutriFlow!'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && <div className="text-red-500 bg-red-50 p-3 rounded-md text-sm">{error}</div>}
          
          {success && (
            <div className="space-y-4">
              <div className="text-green-600 bg-green-50 p-3 rounded-md text-sm">{success}</div>
              <Button onClick={() => navigate(importData?.tipo === 'receita' ? '/receitas' : '/')} className="w-full">
                Ir para o app
              </Button>
            </div>
          )}

          {!error && !success && importData && (
            <div className="bg-muted p-4 rounded-xl mt-2">
              <div className="font-semibold mb-2">Resumo do que será importado:</div>
              {importData.tipo === 'receita' && (
                <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                  <li><strong>Nome:</strong> {importData.dados.nome}</li>
                  <li><strong>Rendimento:</strong> {importData.dados.rendimentoPorcoes} porções</li>
                  <li><strong>Ingredientes:</strong> {importData.dados.ingredientes.length} itens</li>
                  <li><strong>Modo de Preparo:</strong> {importData.dados.instrucoes ? 'Incluso' : 'Nenhum'}</li>
                </ul>
              )}
              {importData.tipo === 'planejamento' && (
                <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                  <li><strong>Refeições no plano:</strong> {importData.dados.registros.length}</li>
                  <li><strong>Total de alimentos:</strong> {importData.dados.itens.length}</li>
                  <li><strong>Atenção:</strong> Isso será inserido no seu Diário no dia de HOJE.</li>
                </ul>
              )}
            </div>
          )}
        </CardContent>

        {!error && !success && importData && (
          <CardFooter>
            <Button onClick={handleImport} className="w-full" size="lg">
              Confirmar e Salvar no Meu App
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
