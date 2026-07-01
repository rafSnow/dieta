import { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Download, Upload, AlertTriangle, Bell, Droplet } from 'lucide-react';
import { backupRepo } from '../../db/repositories/backupRepo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { requestNotificationPermission, agendarLembreteAgua, agendarLembreteRefeicao } from '../../shared/lib/notifications';

export function ConfiguracoesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);
  const [notifPerm, setNotifPerm] = useState<string>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotifPerm(Notification.permission);
    }
  }, []);

  const handleExport = async () => {
    try {
      const jsonStr = await backupRepo.exportarDados();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `nutriflow-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMensagem({ tipo: 'success', texto: 'Backup exportado com sucesso!' });
    } catch (err) {
      setMensagem({ tipo: 'error', texto: 'Erro ao exportar backup.' });
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonStr = event.target?.result as string;
        await backupRepo.importarDados(jsonStr);
        setMensagem({ tipo: 'success', texto: 'Dados importados com sucesso! Recarregue a página para ver as mudanças.' });
      } catch (err) {
        setMensagem({ tipo: 'error', texto: 'Erro ao importar dados. Verifique o formato do arquivo.' });
      }
    };
    reader.readAsText(file);
    
    // Limpar o input para permitir importar o mesmo arquivo se der erro
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = async () => {
    try {
      await backupRepo.resetarBanco();
      setResetOpen(false);
      setMensagem({ tipo: 'success', texto: 'Banco de dados resetado. Os dados foram apagados.' });
    } catch (err) {
      setMensagem({ tipo: 'error', texto: 'Erro ao resetar o banco de dados.' });
    }
  };

  const handleRequestPerm = async () => {
    const granted = await requestNotificationPermission();
    setNotifPerm(granted ? 'granted' : 'denied');
    if (granted) {
      setMensagem({ tipo: 'success', texto: 'Notificações ativadas! Os lembretes locais agora podem ser agendados.' });
    } else {
      setMensagem({ tipo: 'error', texto: 'Permissão negada para notificações.' });
    }
  };

  const handleTestarAgua = async () => {
    // Para teste rápido, agenda para 5 segundos
    const time = Date.now() + 5000;
    await agendarLembreteAgua(time); // Vai usar a lib que usa o Trigger API (ou setTimeout)
    setMensagem({ tipo: 'success', texto: 'Lembrete de água testado para daqui a 5 segundos!' });
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seus dados, backups e lembretes.
        </p>
      </div>

      {mensagem && (
        <div className={`p-4 rounded-md ${mensagem.tipo === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
          {mensagem.texto}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" /> Notificações Locais e Lembretes
          </CardTitle>
          <CardDescription>
            Ative as notificações nativas (mesmo offline) para lembrar de beber água e registrar refeições.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-muted/30 rounded-lg border">
            <div>
              <p className="font-medium">Status da Permissão</p>
              <p className="text-sm text-muted-foreground">
                {notifPerm === 'granted' ? 'Ativado (Permitido)' : notifPerm === 'denied' ? 'Bloqueado pelo Navegador' : 'Não Solicitado'}
              </p>
            </div>
            {notifPerm !== 'granted' && (
              <Button onClick={handleRequestPerm}>Ativar Notificações</Button>
            )}
          </div>

          {notifPerm === 'granted' && (
            <div className="flex flex-col gap-2 mt-4 border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">Simular agendamento para testes práticos (PWA Offline Trigger API)</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleTestarAgua} className="flex-1">
                  <Droplet className="w-4 h-4 mr-2 text-blue-500" />
                  Agendar Água (em 5 seg)
                </Button>
                <Button variant="outline" onClick={() => agendarLembreteRefeicao('Almoço', Date.now() + 10000)} className="flex-1">
                  <Bell className="w-4 h-4 mr-2" />
                  Lembrete Almoço (10 seg)
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup e Restauração</CardTitle>
          <CardDescription>
            Exporte todos os seus dados para um arquivo JSON para manter a segurança das suas informações.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleExport} className="flex-1" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar Backup
            </Button>
            
            <Button onClick={handleImport} className="flex-1" variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Importar Backup
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".json" 
              onChange={handleFileChange} 
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Nota: Ao importar um backup, <strong>todos os seus dados atuais serão substituídos</strong> pelos dados do arquivo.
          </p>
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription>
            Ações irreversíveis que afetarão seus dados salvos neste navegador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={resetOpen} onOpenChange={setResetOpen}>
            <DialogTrigger>
              <div className="bg-destructive text-destructive-foreground hover:bg-destructive/90 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 cursor-pointer">Apagar Todos os Dados</div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Você tem certeza absoluta?</DialogTitle>
                <DialogDescription>
                  Esta ação é irreversível. Todos os alimentos, receitas, registros diários, metas e planejamento serão permanentemente apagados do seu dispositivo. 
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4 gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setResetOpen(false)}>Cancelar</Button>
                <Button variant="destructive" onClick={handleReset}>Sim, apagar tudo</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

    </div>
  );
}
