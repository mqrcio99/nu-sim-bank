import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Printer } from 'lucide-react';

export interface ReceiptData {
  id: string;
  authCode: string;
  type: 'pix' | 'transfer' | 'payment' | 'deposit';
  amount: number;
  date: Date;
  description: string;
  senderName: string;
  senderCpf: string;
  recipient: string;
}

const typeLabels: Record<ReceiptData['type'], string> = {
  pix: 'Pix enviado',
  transfer: 'Transferência enviada',
  payment: 'Pagamento realizado',
  deposit: 'Depósito recebido',
};

const maskCpf = (cpf: string) => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
};

const formatMoney = (value: number) =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Props {
  receipt: ReceiptData | null;
  onClose: () => void;
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-right break-all">{value}</span>
  </div>
);

const TransactionReceipt = ({ receipt, onClose }: Props) => {
  if (!receipt) return null;

  return (
    <Dialog open={!!receipt} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Comprovante</DialogTitle>
        </DialogHeader>

        <div id="receipt-print-area" className="space-y-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <p className="font-bold text-lg">{typeLabels[receipt.type]}</p>
            <p className="text-3xl font-bold">R$ {formatMoney(Math.abs(receipt.amount))}</p>
            <p className="text-xs text-muted-foreground">
              {receipt.date.toLocaleDateString('pt-BR')} às{' '}
              {receipt.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="space-y-3 rounded-xl border p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {receipt.type === 'deposit' ? 'Destino' : 'Origem'}
            </p>
            <Row label="Nome" value={receipt.senderName} />
            <Row label="CPF" value={maskCpf(receipt.senderCpf)} />
            <Row label="Instituição" value="NU-Like Pagamentos S.A." />
            <Row label="Agência / Conta" value="0001 / 12345678-9" />
          </div>

          {receipt.type !== 'deposit' && (
            <div className="space-y-3 rounded-xl border p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Destino
              </p>
              <Row label="Nome" value={receipt.recipient} />
              <Row label="Instituição" value="NU-Like Pagamentos S.A." />
              <Row label="Tipo" value={typeLabels[receipt.type]} />
            </div>
          )}

          <div className="space-y-3 rounded-xl border p-4">
            <Row label="Descrição" value={receipt.description} />
            <Row label="ID da transação" value={receipt.id} />
            <Row label="Código de autenticação" value={receipt.authCode} />
          </div>

          <p className="text-[11px] leading-relaxed text-center text-muted-foreground">
            Comprovante fictício gerado por um simulador bancário. Não possui valor legal ou fiscal.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
          <Button className="flex-1 gradient-primary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionReceipt;
