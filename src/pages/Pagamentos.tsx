import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Pagamento {
  id: string;
  emprestimo_id: string;
  valor_pago: number;
  tipo_pagamento: string;
  data_pagamento: string;
  observacoes: string | null;
  emprestimos: {
    valor_principal: number;
    taxa_juros_mensal: number;
    clientes: {
      nome: string;
    };
  };
}

interface EmprestimoAtivo {
  id: string;
  valor_principal: number;
  taxa_juros_mensal: number;
  clientes: {
    nome: string;
  };
}

const Pagamentos = () => {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [emprestimosAtivos, setEmprestimosAtivos] = useState<EmprestimoAtivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    emprestimo_id: "",
    valor_pago: "",
    tipo_pagamento: "parcial",
    observacoes: "",
  });

  const [emprestimoSelecionado, setEmprestimoSelecionado] = useState<EmprestimoAtivo | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.emprestimo_id) {
      const emprestimo = emprestimosAtivos.find(e => e.id === formData.emprestimo_id);
      setEmprestimoSelecionado(emprestimo || null);
    } else {
      setEmprestimoSelecionado(null);
    }
  }, [formData.emprestimo_id, emprestimosAtivos]);

  const loadData = async () => {
    try {
      const [pagamentosRes, emprestimosRes] = await Promise.all([
        supabase
          .from("pagamentos")
          .select(`
            *,
            emprestimos (
              valor_principal,
              taxa_juros_mensal,
              clientes (nome)
            )
          `)
          .order("data_pagamento", { ascending: false }),
        supabase
          .from("emprestimos")
          .select(`
            id,
            valor_principal,
            taxa_juros_mensal,
            clientes (nome)
          `)
          .in("status", ["ativo", "parcial", "vencido"])
          .order("data_emprestimo", { ascending: false })
      ]);

      if (pagamentosRes.error) throw pagamentosRes.error;
      if (emprestimosRes.error) throw emprestimosRes.error;

      setPagamentos(pagamentosRes.data || []);
      setEmprestimosAtivos(emprestimosRes.data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Inserir pagamento
      const { error: pagamentoError } = await supabase.from("pagamentos").insert({
        user_id: user.id,
        emprestimo_id: formData.emprestimo_id,
        valor_pago: parseFloat(formData.valor_pago),
        tipo_pagamento: formData.tipo_pagamento,
        observacoes: formData.observacoes || null,
      });

      if (pagamentoError) throw pagamentoError;

      // Atualizar status do empréstimo se pagamento total
      if (formData.tipo_pagamento === "total") {
        const { error: updateError } = await supabase
          .from("emprestimos")
          .update({ status: "pago" })
          .eq("id", formData.emprestimo_id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Pagamento registrado!",
        description: "O pagamento foi registrado com sucesso.",
      });

      setDialogOpen(false);
      setFormData({
        emprestimo_id: "",
        valor_pago: "",
        tipo_pagamento: "parcial",
        observacoes: "",
      });
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar pagamento",
        description: error.message,
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularValores = () => {
    if (!emprestimoSelecionado) return null;

    const juros = emprestimoSelecionado.valor_principal * (emprestimoSelecionado.taxa_juros_mensal / 100);
    const total = emprestimoSelecionado.valor_principal + juros;

    return { juros, total };
  };

  const valores = calcularValores();

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Pagamentos</h1>
            <p className="text-muted-foreground">Registre e acompanhe pagamentos</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Registrar Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Pagamento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emprestimo_id">Empréstimo *</Label>
                  <Select
                    value={formData.emprestimo_id}
                    onValueChange={(value) => setFormData({ ...formData, emprestimo_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um empréstimo" />
                    </SelectTrigger>
                    <SelectContent>
                      {emprestimosAtivos.map((emprestimo) => (
                        <SelectItem key={emprestimo.id} value={emprestimo.id}>
                          {emprestimo.clientes.nome} - {formatCurrency(emprestimo.valor_principal)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {valores && (
                  <div className="bg-muted p-3 rounded-lg space-y-1">
                    <p className="text-sm"><strong>Valor Principal:</strong> {formatCurrency(emprestimoSelecionado!.valor_principal)}</p>
                    <p className="text-sm"><strong>Juros ({emprestimoSelecionado!.taxa_juros_mensal}%):</strong> {formatCurrency(valores.juros)}</p>
                    <p className="text-sm font-bold text-success"><strong>Total a Pagar:</strong> {formatCurrency(valores.total)}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="tipo_pagamento">Tipo de Pagamento *</Label>
                  <Select
                    value={formData.tipo_pagamento}
                    onValueChange={(value) => setFormData({ ...formData, tipo_pagamento: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="total">Pagamento Total (Principal + Juros)</SelectItem>
                      <SelectItem value="juros">Apenas Juros</SelectItem>
                      <SelectItem value="parcial">Pagamento Parcial</SelectItem>
                      <SelectItem value="principal">Apenas Principal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_pago">Valor Pago *</Label>
                  <Input
                    id="valor_pago"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor_pago}
                    onChange={(e) => setFormData({ ...formData, valor_pago: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Informações adicionais sobre o pagamento..."
                  />
                </div>

                <Button type="submit" className="w-full">
                  Registrar Pagamento
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : pagamentos.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum pagamento registrado ainda
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor Pago</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagamentos.map((pagamento) => (
                      <TableRow key={pagamento.id}>
                        <TableCell className="font-medium">
                          {pagamento.emprestimos.clientes.nome}
                        </TableCell>
                        <TableCell className="text-success font-medium">
                          {formatCurrency(pagamento.valor_pago)}
                        </TableCell>
                        <TableCell className="capitalize">{pagamento.tipo_pagamento}</TableCell>
                        <TableCell>{formatDate(pagamento.data_pagamento)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {pagamento.observacoes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Pagamentos;
