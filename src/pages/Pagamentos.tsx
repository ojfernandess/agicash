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
  mes_pagamento: number | null;
  ano_pagamento: number | null;
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
  parcelado?: boolean;
  valor_parcela?: number | null;
  clientes: {
    nome: string;
  };
}

interface Parcela {
  id: string;
  emprestimo_id: string;
  numero_parcela: number;
  valor_parcela: number;
  data_vencimento: string;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  juros_aplicados: number | null;
  multa_aplicada: number | null;
}

<<<<<<< HEAD
interface MesPendente {
  mes: number;
  ano: number;
  valor_esperado: number;
  valor_pago: number;
  diferenca: number;
  status: 'pendente' | 'parcial' | 'pago';
  data_ultimo_pagamento: string | null;
}

=======
>>>>>>> 61192210186a01f5e176b8940520f10050027d63
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
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [parcelaId, setParcelaId] = useState<string>("");
<<<<<<< HEAD
  const [mesesPendentes, setMesesPendentes] = useState<MesPendente[]>([]);
  const [mesSelecionado, setMesSelecionado] = useState<string>("");
=======
>>>>>>> 61192210186a01f5e176b8940520f10050027d63

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.emprestimo_id) {
      const emprestimo = emprestimosAtivos.find(e => e.id === formData.emprestimo_id);
      setEmprestimoSelecionado(emprestimo || null);
<<<<<<< HEAD
      
=======
>>>>>>> 61192210186a01f5e176b8940520f10050027d63
      // Carregar parcelas se for parcelado
      if (emprestimo?.parcelado) {
        supabase
          .from('parcelas')
          .select('*')
          .eq('emprestimo_id', emprestimo.id)
          .order('numero_parcela', { ascending: true })
          .then(({ data, error }) => {
            if (error) {
              console.error('Erro ao carregar parcelas:', error);
              setParcelas([]);
            } else {
              setParcelas(data || []);
            }
          });
      } else {
        setParcelas([]);
      }
<<<<<<< HEAD
      
      // Carregar meses pendentes
      loadMesesPendentes(emprestimo.id);
    } else {
      setEmprestimoSelecionado(null);
      setParcelas([]);
      setMesesPendentes([]);
=======
    } else {
      setEmprestimoSelecionado(null);
      setParcelas([]);
>>>>>>> 61192210186a01f5e176b8940520f10050027d63
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
            parcelado,
            valor_parcela,
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

<<<<<<< HEAD
  const loadMesesPendentes = async (emprestimoId: string) => {
    try {
      // Buscar empréstimo para obter dados
      const { data: emprestimo, error: emprestimoError } = await supabase
        .from('emprestimos')
        .select('*')
        .eq('id', emprestimoId)
        .single();

      if (emprestimoError) {
        console.error('Erro ao carregar empréstimo:', emprestimoError);
        setMesesPendentes([]);
        return;
      }

      // Buscar pagamentos existentes para este empréstimo
      const { data: pagamentos, error: pagamentosError } = await supabase
        .from('pagamentos')
        .select('mes_pagamento, ano_pagamento, valor_pago')
        .eq('emprestimo_id', emprestimoId);

      if (pagamentosError) {
        console.error('Erro ao carregar pagamentos:', pagamentosError);
        setMesesPendentes([]);
        return;
      }

      // Gerar meses baseado na data do empréstimo até hoje
      const meses = gerarMesesPendentes(emprestimo, pagamentos || []);
      setMesesPendentes(meses);
    } catch (error) {
      console.error('Erro ao carregar meses pendentes:', error);
      setMesesPendentes([]);
    }
  };

  const gerarMesesPendentes = (emprestimo: any, pagamentos: any[]): MesPendente[] => {
    const meses: MesPendente[] = [];
    const dataInicio = new Date(emprestimo.data_emprestimo);
    const dataAtual = new Date();
    
    // Calcular valor esperado por mês
    let valorEsperado = 0;
    if (emprestimo.parcelado && emprestimo.valor_parcela) {
      valorEsperado = emprestimo.valor_parcela;
    } else {
      // Se não for parcelado, calcular juros mensais
      valorEsperado = emprestimo.valor_principal * (emprestimo.taxa_juros_mensal / 100);
    }

    // Gerar meses do empréstimo até hoje
    let mesAtual = dataInicio.getMonth() + 1;
    let anoAtual = dataInicio.getFullYear();

    while (anoAtual < dataAtual.getFullYear() || 
           (anoAtual === dataAtual.getFullYear() && mesAtual <= dataAtual.getMonth() + 1)) {
      
      // Calcular total pago neste mês
      const pagamentosDoMes = pagamentos.filter(p => 
        p.mes_pagamento === mesAtual && p.ano_pagamento === anoAtual
      );
      
      const valorPago = pagamentosDoMes.reduce((total, p) => total + (p.valor_pago || 0), 0);
      const diferenca = valorEsperado - valorPago;
      
      // Determinar status
      let status: 'pendente' | 'parcial' | 'pago' = 'pendente';
      if (valorPago >= valorEsperado) {
        status = 'pago';
      } else if (valorPago > 0) {
        status = 'parcial';
      }

      meses.push({
        mes: mesAtual,
        ano: anoAtual,
        valor_esperado: valorEsperado,
        valor_pago: valorPago,
        diferenca: diferenca,
        status: status,
        data_ultimo_pagamento: pagamentosDoMes.length > 0 ? 
          pagamentosDoMes[pagamentosDoMes.length - 1].data_pagamento : null
      });

      // Avançar para o próximo mês
      mesAtual++;
      if (mesAtual > 12) {
        mesAtual = 1;
        anoAtual++;
      }
    }

    return meses;
  };

=======
>>>>>>> 61192210186a01f5e176b8940520f10050027d63
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const valorPagoNumber = parseFloat(formData.valor_pago);
      if (!Number.isFinite(valorPagoNumber) || valorPagoNumber <= 0) {
        throw new Error('Informe um valor válido.');
      }

<<<<<<< HEAD
      // Obter mês e ano do pagamento
      const dataAtual = new Date();
      let mesPagamento: number;
      let anoPagamento: number;
      
      if (mesSelecionado === 'atual') {
        mesPagamento = dataAtual.getMonth() + 1;
        anoPagamento = dataAtual.getFullYear();
      } else if (mesSelecionado) {
        mesPagamento = parseInt(mesSelecionado.split('/')[0]);
        anoPagamento = parseInt(mesSelecionado.split('/')[1]);
      } else {
        throw new Error('Selecione o mês/ano do pagamento.');
      }

=======
>>>>>>> 61192210186a01f5e176b8940520f10050027d63
      // Se for parcelado e o tipo selecionado for 'parcela', exigir seleção de parcela e quitar
      if (emprestimoSelecionado?.parcelado && formData.tipo_pagamento === 'parcela') {
        if (!parcelaId) {
          throw new Error('Selecione a parcela para registrar o pagamento.');
        }
        const parcela = parcelas.find(p => p.id === parcelaId);
        if (!parcela) throw new Error('Parcela inválida.');

        // Registrar no histórico de pagamentos
        const { error: pagamentoError } = await supabase.from("pagamentos").insert({
          user_id: user.id,
          emprestimo_id: formData.emprestimo_id,
          valor_pago: valorPagoNumber,
          tipo_pagamento: 'parcela',
<<<<<<< HEAD
          mes_pagamento: mesPagamento,
          ano_pagamento: anoPagamento,
=======
>>>>>>> 61192210186a01f5e176b8940520f10050027d63
          observacoes: `Pagamento da parcela #${parcela.numero_parcela}`,
        });
        if (pagamentoError) throw pagamentoError;

        // Atualizar a parcela como paga
        const { error: parcelaError } = await supabase
          .from('parcelas')
          .update({
            valor_pago: valorPagoNumber,
            data_pagamento: new Date().toISOString().slice(0, 10),
            status: 'pago',
          })
          .eq('id', parcelaId);
        if (parcelaError) throw parcelaError;

        // Se todas as parcelas foram pagas, marcar empréstimo como pago
        const { data: restantes, error: restError } = await supabase
          .from('parcelas')
          .select('id')
          .eq('emprestimo_id', formData.emprestimo_id)
          .neq('status', 'pago');
        if (restError) throw restError;
        if (!restantes || restantes.length === 0) {
          await supabase.from('emprestimos').update({ status: 'pago' }).eq('id', formData.emprestimo_id);
        }
      } else {
        // Fluxo anterior (não parcelado)
        const { error: pagamentoError } = await supabase.from("pagamentos").insert({
          user_id: user.id,
          emprestimo_id: formData.emprestimo_id,
          valor_pago: valorPagoNumber,
          tipo_pagamento: formData.tipo_pagamento,
<<<<<<< HEAD
          mes_pagamento: mesPagamento,
          ano_pagamento: anoPagamento,
=======
>>>>>>> 61192210186a01f5e176b8940520f10050027d63
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
      }

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
      setParcelaId("");
<<<<<<< HEAD
      setMesSelecionado("");
=======
>>>>>>> 61192210186a01f5e176b8940520f10050027d63
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

<<<<<<< HEAD
  const formatMonthYear = (mes: number, ano: number) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[mes - 1]}/${ano}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'text-green-600';
      case 'parcial': return 'text-yellow-600';
      case 'pendente': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

=======
>>>>>>> 61192210186a01f5e176b8940520f10050027d63
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

<<<<<<< HEAD
                {/* Seção de Seleção de Mês/Ano */}
                <div className="space-y-2">
                  <Label>Mês/Ano do Pagamento *</Label>
                  <Select value={mesSelecionado} onValueChange={setMesSelecionado} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o mês/ano do pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Opção para mês atual */}
                      <SelectItem value="atual">
                        {formatMonthYear(new Date().getMonth() + 1, new Date().getFullYear())} - Mês Atual
                      </SelectItem>
                      
                      {/* Meses do empréstimo */}
                      {mesesPendentes.map((mes) => (
                        <SelectItem key={`${mes.mes}/${mes.ano}`} value={`${mes.mes}/${mes.ano}`}>
                          {formatMonthYear(mes.mes, mes.ano)} - {formatCurrency(mes.valor_esperado)} 
                          <span className={`ml-2 ${getStatusColor(mes.status)}`}>
                            ({mes.status})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground">
                    Selecione o mês/ano para o qual este pagamento se refere. Isso evita cobrança de juros diários.
                  </div>
                </div>

=======
>>>>>>> 61192210186a01f5e176b8940520f10050027d63
                {valores && (
                  <div className="bg-muted p-3 rounded-lg space-y-1">
                    <p className="text-sm"><strong>Valor Principal:</strong> {formatCurrency(emprestimoSelecionado!.valor_principal)}</p>
                    <p className="text-sm"><strong>Juros ({emprestimoSelecionado!.taxa_juros_mensal}%):</strong> {formatCurrency(valores.juros)}</p>
                    <p className="text-sm font-bold text-success"><strong>Total a Pagar:</strong> {formatCurrency(valores.total)}</p>
                  </div>
                )}

                {/* Seleção de parcela quando for parcelado */}
                {emprestimoSelecionado?.parcelado && (
                  <div className="space-y-2">
                    <Label htmlFor="parcela_id">Parcela</Label>
                    <Select value={parcelaId} onValueChange={setParcelaId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a parcela" />
                      </SelectTrigger>
                      <SelectContent>
                        {parcelas.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            #{p.numero_parcela} - {formatCurrency(p.valor_parcela)} {p.status !== 'pago' ? `( ${p.status} )` : '(pago)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-muted-foreground">
                      Selecione a parcela para registrar o pagamento específico.
                    </div>
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
                      {emprestimoSelecionado?.parcelado && (
                        <SelectItem value="parcela">Pagamento de Parcela</SelectItem>
                      )}
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

<<<<<<< HEAD
        {/* Resumo de Meses Pendentes */}
        {emprestimoSelecionado && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Resumo de Pagamentos Mensais - {emprestimoSelecionado.clientes.nome}</CardTitle>
            </CardHeader>
            <CardContent>
              {mesesPendentes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum mês de pagamento encontrado para este empréstimo.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mês/Ano</TableHead>
                        <TableHead>Valor Esperado</TableHead>
                        <TableHead>Valor Pago</TableHead>
                        <TableHead>Diferença</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Último Pagamento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mesesPendentes.map((mes) => (
                        <TableRow key={`${mes.mes}/${mes.ano}`}>
                          <TableCell className="font-medium">
                            {formatMonthYear(mes.mes, mes.ano)}
                          </TableCell>
                          <TableCell>{formatCurrency(mes.valor_esperado)}</TableCell>
                          <TableCell>{formatCurrency(mes.valor_pago)}</TableCell>
                          <TableCell className={mes.diferenca > 0 ? 'text-red-600' : 'text-green-600'}>
                            {formatCurrency(mes.diferenca)}
                          </TableCell>
                          <TableCell>
                            <span className={`capitalize ${getStatusColor(mes.status)}`}>
                              {mes.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {mes.data_ultimo_pagamento ? formatDate(mes.data_ultimo_pagamento) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

=======
>>>>>>> 61192210186a01f5e176b8940520f10050027d63
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
<<<<<<< HEAD
                      <TableHead>Mês/Ano</TableHead>
=======
>>>>>>> 61192210186a01f5e176b8940520f10050027d63
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
<<<<<<< HEAD
                        <TableCell>
                          {pagamento.mes_pagamento && pagamento.ano_pagamento 
                            ? formatMonthYear(pagamento.mes_pagamento, pagamento.ano_pagamento)
                            : '-'
                          }
                        </TableCell>
=======
>>>>>>> 61192210186a01f5e176b8940520f10050027d63
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
