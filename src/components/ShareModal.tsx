import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, Check } from 'lucide-react';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo: 'receita' | 'planejamento';
  nomeItem: string;
  payload: any;
}

export function ShareModal({ open, onOpenChange, tipo, nomeItem, payload }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  // Comprimir payload para base64
  const payloadStr = JSON.stringify({ tipo, dados: payload });
  const base64Payload = btoa(encodeURIComponent(payloadStr));

  // Link para a rota de importação (BrowserRouter)
  const baseHost = window.location.origin;
  const shareUrl = `${baseHost}/import?data=${base64Payload}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `NutriFlow - Compartilhando ${tipo}`,
          text: `Olha só ess${tipo === 'receita' ? 'a' : 'e'} ${tipo} que eu fiz: ${nomeItem}!`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Falha ao compartilhar:', err);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col items-center">
        <DialogHeader className="w-full text-center">
          <DialogTitle>Compartilhar {tipo === 'receita' ? 'Receita' : 'Planejamento'}</DialogTitle>
          <DialogDescription>
            {nomeItem}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-white p-4 rounded-xl shadow-sm border mt-4">
          <QRCodeSVG value={shareUrl} size={200} />
        </div>
        
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Escaneie o QR Code com a câmera do celular para importar direto para o NutriFlow, ou envie o link abaixo.
        </p>

        <div className="flex gap-2 w-full mt-6">
          <Button variant="outline" className="flex-1" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copiado!' : 'Copiar Link'}
          </Button>

          {!!navigator.share && (
            <Button className="flex-1" onClick={handleNativeShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
