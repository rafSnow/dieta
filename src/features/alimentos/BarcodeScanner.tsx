import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '../../components/ui/button';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onCancel: () => void;
}

export function BarcodeScanner({ onScan, onCancel }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Configuração do Scanner
    scannerRef.current = new Html5QrcodeScanner(
      "barcode-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0,
      },
      false
    );

    scannerRef.current.render(
      (text) => {
        // Encontrou um código
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
        onScan(text);
      },
      () => {
        // Erros de leitura ocorrem a cada frame que falha, então ignoramos no console
      }
    );

    // Cleanup ao desmontar (fechar modal)
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Falha ao limpar scanner", e));
      }
    };
  }, [onScan]);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-muted/30 rounded-lg overflow-hidden border">
        <div id="barcode-reader" className="w-full"></div>
      </div>
      <Button variant="outline" onClick={onCancel}>
        Cancelar Leitura
      </Button>
    </div>
  );
}
