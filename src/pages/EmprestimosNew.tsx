import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calculator, CreditCard, Eye, Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useParcelamento } from "@/hooks/use-parcelamento";
import { EmprestimoComParcelamento, ConfiguracaoParcelamento, Parcela } from "@/types/parcelamento";

interface Cliente {
  id: string;
  nome: string;
}

const EmprestimosNew = () => {
  const [emprestimos, setEmprestimos] = useState<EmprestimoComParcelamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [parcelasDialogOpen, setParcelasDialogOpen] = useState(false);
  const [selectedEmprestimo, setSelectedEmprestimo] = useState<EmprestimoComParcelamento | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const { toast } = useToast();
  const { gerarParcelas, buscarParcelas, loading: parcelamentoLoading } = useParcelamento();

  const [formData, setFormData] = useState({
    cliente_id: "",
    valor_principal: "",
    taxa_juros_mensal: "30",
    taxa_juros_diaria_atraso: "0.05",
    data_emprestimo: new Date().toISOString().split("T")[0],
    data_vencimento: "",
  });

  const [parcelamentoConfig, setParcelamentoConfig] = useState<ConfiguracaoParcelamento>({
    parcelado: false,
    numero_parcelas: 1,
    valor_parcela: 0,
    intervalo_pagamento: 30,
    data_primeira_parcela: new Date().toISOString().split("T")[0],
    observacoes_parcelamento: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Calcular vencimento padrão (30 dias)
    const hoje = new Date(formData.data_emprestimo);
    const vencimento = new Date(hoje);
    vencimento.setDate(vencimento.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      data_vencimento: vencimento.toISOString().split("T")[0]
    }));
  }, [formData.data_emprestimo]);

  useEffect(() => {
    // Calcular valor da parcela quando parcelamento é ativado
    if (parcelamentoConfig.parcelado && formData.valor_principal) {
      const valor = parseFloat(formData.valor_principal);
      const parcelas = parcelamentoConfig.numero_parcelas;
      const valorParcela = valor / parcelas;
      
      setParcelamentoConfig(prev => ({
        ...prev,
        valor_parcela: Math.round(valorParcela * 100) / 100
      }));
    }
  }, [parcelamentoConfig.parcelado, parcelamentoConfig.numero_parcelas, formData.valor_emprestimo]);

  const loadData = async () => {
    try {
      const [emprestimosRes, clientesRes] = await Promise.all([
        supabase
          .from("emprestimos")
          .select(`
            *,
            clientes (nome)
          `)
          .order("data_emprestimo", { ascending: false }),
        supabase
          .from("clientes")
          .select("id, nome")
          .eq("status", "ativo")
          .order("nome")
      ]);

      if (emprestimosRes.error) throw emprestimosRes.error;
      if (clientesRes.error) throw clientesRes.error;

      setEmprestimos(emprestimosRes.data || []);
      setClientes(clientesRes.data || []);
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

  const handleDeleteEmprestimo = async (emprestimoId: string) => {
    try {
      const { error } = await supabase.from("emprestimos").delete().eq("id", emprestimoId);
      if (error) throw error;
      toast({ title: "Empréstimo excluído", description: "O empréstimo foi removido com sucesso." });
      setDeleteDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao excluir", description: error.message });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        throw authError;
      }
      const userId = authData?.user?.id;
      if (!userId) {
        toast({ variant: "destructive", title: "Sessão inválida", description: "Faça login novamente." });
        return;
      }

      const valorPrincipal = Number(formData.valor_principal);
      const taxaJurosMensal = Number(formData.taxa_juros_mensal);
      const taxaAtraso = Number(formData.taxa_juros_diaria_atraso);

      if (!formData.cliente_id) {
        toast({ variant: "destructive", title: "Cliente obrigatório", description: "Selecione um cliente." });
        return;
      }
      if (!Number.isFinite(valorPrincipal) || valorPrincipal <= 0) {
        toast({ variant: "destructive", title: "Valor inválido", description: "Informe um valor principal válido." });
        return;
      }
      if (!Number.isFinite(taxaJurosMensal)) {
        toast({ variant: "destructive", title: "Taxa inválida", description: "Informe uma taxa de juros mensal válida." });
        return;
      }
      if (!Number.isFinite(taxaAtraso)) {
        toast({ variant: "destructive", title: "Taxa de atraso inválida", description: "Informe uma taxa diária de atraso válida." });
        return;
      }

      const emprestimoData = {
        user_id: userId,
        cliente_id: formData.cliente_id,
        valor_principal: valorPrincipal,
        data_emprestimo: formData.data_emprestimo,
        data_vencimento: formData.data_vencimento,
        taxa_juros_mensal: taxaJurosMensal,
        taxa_juros_diaria_atraso: taxaAtraso,
        status: "ativo",
        // Campos de parcelamento
        parcelado: parcelamentoConfig.parcelado,
        numero_parcelas: parcelamentoConfig.parcelado ? parcelamentoConfig.numero_parcelas : null,
        valor_parcela: parcelamentoConfig.parcelado ? parcelamentoConfig.valor_parcela : null,
        intervalo_pagamento: parcelamentoConfig.parcelado ? parcelamentoConfig.intervalo_pagamento : null,
        data_primeira_parcela: parcelamentoConfig.parcelado ? parcelamentoConfig.data_primeira_parcela : null,
        observacoes_parcelamento: parcelamentoConfig.parcelado ? parcelamentoConfig.observacoes_parcelamento : null,
      };

      const { data, error } = await supabase
        .from("emprestimos")
        .insert(emprestimoData)
        .select()
        .single();

      if (error) {
        console.error('Erro Supabase ao inserir emprestimo:', error, 'payload:', emprestimoData);
        throw error;
      }

      // Se é parcelado, gerar as parcelas
      if (parcelamentoConfig.parcelado) {
        const sucesso = await gerarParcelas(data.id, parcelamentoConfig);
        if (!sucesso) {
          toast({
            variant: "destructive",
            title: "Erro ao gerar parcelas",
            description: "Empréstimo criado, mas não foi possível gerar as parcelas.",
          });
        }
      }

      toast({
        title: "Empréstimo criado!",
        description: parcelamentoConfig.parcelado 
          ? `Empréstimo parcelado em ${parcelamentoConfig.numero_parcelas} parcelas criado com sucesso.`
          : "Empréstimo criado com sucesso.",
      });

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar empréstimo",
        description: error.message,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      cliente_id: "",
      valor_principal: "",
      taxa_juros_mensal: "30",
      taxa_juros_diaria_atraso: "0.05",
      data_emprestimo: new Date().toISOString().split("T")[0],
      data_vencimento: "",
    });
    setParcelamentoConfig({
      parcelado: false,
      numero_parcelas: 1,
      valor_parcela: 0,
      intervalo_pagamento: 30,
      data_primeira_parcela: new Date().toISOString().split("T")[0],
      observacoes_parcelamento: "",
    });
  };

  const handleVerParcelas = async (emprestimo: EmprestimoComParcelamento) => {
    setSelectedEmprestimo(emprestimo);
    const parcelasData = await buscarParcelas(emprestimo.id);
    setParcelas(parcelasData);
    setParcelasDialogOpen(true);
  };

  const exportarPDF = async (emprestimo: EmprestimoComParcelamento) => {
    try {
      const [{ jsPDF }, qrm] = await Promise.all([
        import('jspdf'),
        import('qrcode')
      ]);

      // Buscar parcelas se parcelado
      const parcelasLista = emprestimo.parcelado ? await buscarParcelas(emprestimo.id) : [];

      // Buscar admin para pix
      const { data: admin } = await supabase
        .from('profiles')
        .select('nome, pix_key, pix_tipo')
        .eq('role', 'admin')
        .limit(1)
        .maybeSingle();

      const doc = new jsPDF();
      let y = 15;
      doc.setFontSize(16);
      doc.text('Comprovante de Vencimento', 14, y); y += 8;
      doc.setFontSize(12);
      doc.text(`Cliente: ${emprestimo.clientes?.nome || ''}`, 14, y); y += 6;
      doc.text(`Empréstimo: R$ ${Number(emprestimo.valor_principal).toFixed(2)}`, 14, y); y += 6;
      doc.text(`Vencimento: ${formatDate(emprestimo.data_vencimento)}`, 14, y); y += 6;
      doc.text(`Juros mensal: ${Number(emprestimo.taxa_juros_mensal || 0)}%`, 14, y); y += 6;
      doc.text(`Juros diário atraso: ${Number(emprestimo.taxa_juros_diaria_atraso || 0)}%`, 14, y); y += 8;

      if (emprestimo.parcelado) {
        doc.setFontSize(14);
        doc.text('Parcelas', 14, y); y += 6;
        doc.setFontSize(11);
        parcelasLista.forEach((p) => {
          doc.text(`#${p.numero_parcela} - Valor: R$ ${Number(p.valor_parcela).toFixed(2)} - Venc: ${formatDate(p.data_vencimento)} - Status: ${p.status}`, 14, y);
          y += 6;
          if (y > 270) { doc.addPage(); y = 15; }
        });
        y += 4;
      }

      if (admin?.pix_key) {
        doc.setFontSize(14);
        doc.text('Pagamento via Pix', 14, y); y += 6;
        doc.setFontSize(11);
        doc.text(`Chave (${admin.pix_tipo || 'pix'}): ${admin.pix_key}`, 14, y); y += 6;
        // Gerar QR de forma simples com a chave (não BR Code completo)
        const toDataURL = (qrm as any).toDataURL || (qrm as any).default?.toDataURL;
        const qrDataUrl = await toDataURL(admin.pix_key);
        doc.addImage(qrDataUrl, 'PNG', 14, y, 40, 40);
        y += 46;
      }

      doc.save(`vencimento_${emprestimo.id}.pdf`);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao exportar PDF', description: (err as any).message });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: "default",
      pago: "secondary",
      atrasado: "destructive",
      cancelado: "outline",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando empréstimos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Empréstimos</h1>
            <p className="text-muted-foreground">Gerencie empréstimos e parcelamentos</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Empréstimo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Empréstimo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="basico" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basico">Informações Básicas</TabsTrigger>
                    <TabsTrigger value="parcelamento">Parcelamento</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basico" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cliente_id">Cliente</Label>
                      <Select
                        value={formData.cliente_id}
                        onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                              {cliente.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="valor_principal">Valor do Empréstimo</Label>
                        <Input
                          id="valor_principal"
                          type="number"
                          step="0.01"
                          value={formData.valor_principal}
                          onChange={(e) => setFormData({ ...formData, valor_principal: e.target.value })}
                          placeholder="0,00"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="taxa_juros_mensal">Taxa de Juros Mensal (%)</Label>
                        <Input
                          id="taxa_juros_mensal"
                          type="number"
                          step="0.01"
                          value={formData.taxa_juros_mensal}
                          onChange={(e) => setFormData({ ...formData, taxa_juros_mensal: e.target.value })}
                          placeholder="30"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="data_emprestimo">Data do Empréstimo</Label>
                        <Input
                          id="data_emprestimo"
                          type="date"
                          value={formData.data_emprestimo}
                          onChange={(e) => setFormData({ ...formData, data_emprestimo: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                        <Input
                          id="data_vencimento"
                          type="date"
                          value={formData.data_vencimento}
                          onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxa_juros_diaria_atraso">Taxa de Juros Diária por Atraso (%)</Label>
                      <Input
                        id="taxa_juros_diaria_atraso"
                        type="number"
                        step="0.001"
                        value={formData.taxa_juros_diaria_atraso}
                        onChange={(e) => setFormData({ ...formData, taxa_juros_diaria_atraso: e.target.value })}
                        placeholder="0.05"
                        required
                      />
                    </div>

                    {/* Preview dos Valores */}
                    {formData.valor_principal && formData.taxa_juros_mensal && (
                      <div className="p-4 bg-muted rounded-lg space-y-2">
                        <h4 className="font-medium text-sm">Preview dos Valores</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Valor Principal:</span>
                            <div className="font-medium">{formatCurrency(Number(formData.valor_principal))}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Taxa de Juros:</span>
                            <div className="font-medium">{formData.taxa_juros_mensal}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Valor dos Juros:</span>
                            <div className="font-medium">
                              {formatCurrency(Number(formData.valor_principal) * (Number(formData.taxa_juros_mensal) / 100))}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Valor Total:</span>
                            <div className="font-bold text-lg">
                              {formatCurrency(Number(formData.valor_principal) * (1 + Number(formData.taxa_juros_mensal) / 100))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </TabsContent>

                  <TabsContent value="parcelamento" className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="parcelado"
                        checked={parcelamentoConfig.parcelado}
                        onCheckedChange={(checked) => 
                          setParcelamentoConfig({ ...parcelamentoConfig, parcelado: !!checked })
                        }
                      />
                      <Label htmlFor="parcelado">Empréstimo Parcelado (opcional)</Label>
                    </div>

                    {parcelamentoConfig.parcelado && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="numero_parcelas">Número de Parcelas</Label>
                            <Input
                              id="numero_parcelas"
                              type="number"
                              min="1"
                              value={parcelamentoConfig.numero_parcelas}
                              onChange={(e) => setParcelamentoConfig({ 
                                ...parcelamentoConfig, 
                                numero_parcelas: parseInt(e.target.value) || 1 
                              })}
                              required={parcelamentoConfig.parcelado}
                              disabled={!parcelamentoConfig.parcelado}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="valor_parcela">Valor da Parcela</Label>
                            <Input
                              id="valor_parcela"
                              type="number"
                              step="0.01"
                              value={parcelamentoConfig.valor_parcela}
                              onChange={(e) => setParcelamentoConfig({ 
                                ...parcelamentoConfig, 
                                valor_parcela: parseFloat(e.target.value) || 0 
                              })}
                              placeholder="0,00"
                              required={parcelamentoConfig.parcelado}
                              disabled={!parcelamentoConfig.parcelado}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="intervalo_pagamento">Intervalo entre Parcelas (dias)</Label>
                            <Input
                              id="intervalo_pagamento"
                              type="number"
                              min="1"
                              value={parcelamentoConfig.intervalo_pagamento}
                              onChange={(e) => setParcelamentoConfig({ 
                                ...parcelamentoConfig, 
                                intervalo_pagamento: parseInt(e.target.value) || 30 
                              })}
                              required={parcelamentoConfig.parcelado}
                              disabled={!parcelamentoConfig.parcelado}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="data_primeira_parcela">Data da Primeira Parcela</Label>
                            <Input
                              id="data_primeira_parcela"
                              type="date"
                              value={parcelamentoConfig.data_primeira_parcela}
                              onChange={(e) => setParcelamentoConfig({ 
                                ...parcelamentoConfig, 
                                data_primeira_parcela: e.target.value 
                              })}
                              required={parcelamentoConfig.parcelado}
                              disabled={!parcelamentoConfig.parcelado}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="observacoes_parcelamento">Observações do Parcelamento</Label>
                          <Input
                            id="observacoes_parcelamento"
                            value={parcelamentoConfig.observacoes_parcelamento}
                            onChange={(e) => setParcelamentoConfig({ 
                              ...parcelamentoConfig, 
                              observacoes_parcelamento: e.target.value 
                            })}
                            placeholder="Observações sobre o parcelamento..."
                          />
                        </div>

                        {/* Preview do Parcelamento */}
                        {parcelamentoConfig.parcelado && parcelamentoConfig.numero_parcelas > 0 && parcelamentoConfig.valor_parcela > 0 && (
                          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg space-y-3">
                            <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">Resumo do Parcelamento</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Número de Parcelas:</span>
                                <div className="font-medium">{parcelamentoConfig.numero_parcelas}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Valor por Parcela:</span>
                                <div className="font-medium">{formatCurrency(parcelamentoConfig.valor_parcela)}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Intervalo:</span>
                                <div className="font-medium">{parcelamentoConfig.intervalo_pagamento} dias</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Primeira Parcela:</span>
                                <div className="font-medium">{formatDate(parcelamentoConfig.data_primeira_parcela)}</div>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Valor Total das Parcelas:</span>
                                <div className="font-bold text-lg text-blue-900 dark:text-blue-100">
                                  {formatCurrency(parcelamentoConfig.valor_parcela * parcelamentoConfig.numero_parcelas)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      </>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={parcelamentoLoading}>
                    {parcelamentoLoading ? "Criando..." : "Criar Empréstimo"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Empréstimos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data Empréstimo</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Parcelado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emprestimos.map((emprestimo) => (
                    <TableRow key={emprestimo.id}>
                      <TableCell className="font-medium">
                        {emprestimo.clientes?.nome}
                      </TableCell>
                      <TableCell>{formatCurrency(Number(emprestimo.valor_principal || 0))}</TableCell>
                      <TableCell>{formatDate(emprestimo.data_emprestimo)}</TableCell>
                      <TableCell>{formatDate(emprestimo.data_vencimento)}</TableCell>
                      <TableCell>{getStatusBadge(emprestimo.status)}</TableCell>
                      <TableCell>
                        {emprestimo.parcelado ? (
                          <Badge variant="secondary">
                            {emprestimo.numero_parcelas} parcelas
                          </Badge>
                        ) : (
                          <Badge variant="outline">À vista</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {emprestimo.parcelado && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerParcelas(emprestimo)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Parcelas
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => exportarPDF(emprestimo)}>
                            <Download className="mr-2 h-4 w-4" />
                            PDF
                          </Button>
                          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir empréstimo?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação é irreversível. As parcelas associadas serão removidas automaticamente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteEmprestimo(emprestimo.id)}>
                                  Confirmar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog para visualizar parcelas */}
        <Dialog open={parcelasDialogOpen} onOpenChange={setParcelasDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Parcelas - {selectedEmprestimo?.clientes?.nome}
              </DialogTitle>
            </DialogHeader>
            {parcelas.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parcela</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Juros</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parcelas.map((parcela) => (
                    <TableRow key={parcela.id}>
                      <TableCell className="font-medium">
                        {parcela.numero_parcela}
                      </TableCell>
                      <TableCell>{formatCurrency(parcela.valor_parcela)}</TableCell>
                      <TableCell>{formatDate(parcela.data_vencimento)}</TableCell>
                      <TableCell>
                        {parcela.data_pagamento ? formatDate(parcela.data_pagamento) : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(parcela.status)}</TableCell>
                      <TableCell>
                        {parcela.juros_aplicados > 0 ? formatCurrency(parcela.juros_aplicados) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma parcela encontrada.
              </p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default EmprestimosNew;
