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
import { Plus, Calculator, CreditCard, Eye, Trash2, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useParcelamento } from "@/hooks/use-parcelamento";
import { EmprestimoComParcelamento, ConfiguracaoParcelamento, Parcela } from "@/types/parcelamento";
import { useSystemConfig as useSystemConfigConfig } from "@/hooks/use-system-config-new";

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
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [admins, setAdmins] = useState<{ id: string; nome: string | null; pix_key: string | null; pix_tipo: string | null }[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const { toast } = useToast();
  const { gerarParcelas, buscarParcelas, loading: parcelamentoLoading } = useParcelamento();
  const { config: systemConfig } = useSystemConfigConfig();

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

  const exportarPDF = async (emprestimo: EmprestimoComParcelamento, parcelaEspecifica?: any) => {
    try {
      const [{ jsPDF }, qrm] = await Promise.all([
        import('jspdf'),
        import('qrcode')
      ]);

      // Buscar parcelas se parcelado
      const parcelasLista = emprestimo.parcelado ? await buscarParcelas(emprestimo.id) : [];

      // Buscar dados do cliente (endereço)
      const { data: clienteInfo } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', emprestimo.cliente_id)
        .maybeSingle();

      // Admin selecionado
      const admin = admins.find(a => a.id === selectedAdminId) || null;

      // Cálculo de pendente e atraso
      const hoje = new Date();
      const vencGeral = new Date(emprestimo.data_vencimento);
      const diasAtraso = Math.max(0, Math.floor((hoje.getTime() - vencGeral.getTime()) / (1000 * 60 * 60 * 24)));
      const dailyRate = Number((emprestimo as any).taxa_juros_diaria_atraso || 0) / 100;
      let valorPendente = 0;
      
      // Se for uma parcela específica, calcular apenas essa parcela
      if (parcelaEspecifica) {
        const base = Number(parcelaEspecifica.valor_parcela || 0);
        const acres = Number((parcelaEspecifica as any).juros_aplicados || 0) + Number((parcelaEspecifica as any).multa_aplicada || 0);
        const venc = new Date(parcelaEspecifica.data_vencimento);
        const dias = Math.max(0, Math.floor((hoje.getTime() - venc.getTime()) / (1000 * 60 * 60 * 24)));
        const daily = dias > 0 && dailyRate > 0 ? base * dailyRate * dias : 0;
        valorPendente = base + acres + daily;
      } else if (emprestimo.parcelado) {
        valorPendente = parcelasLista
          .filter(p => p.status !== 'pago')
          .reduce((acc, p) => {
            const base = Number(p.valor_parcela || 0);
            const acres = Number((p as any).juros_aplicados || 0) + Number((p as any).multa_aplicada || 0);
            const venc = new Date(p.data_vencimento);
            const dias = Math.max(0, Math.floor((hoje.getTime() - venc.getTime()) / (1000 * 60 * 60 * 24)));
            const daily = dias > 0 && dailyRate > 0 ? base * dailyRate * dias : 0;
            return acc + base + acres + daily;
          }, 0);
      } else {
        const mensal = Number(emprestimo.valor_principal) * (1 + Number((emprestimo as any).taxa_juros_mensal || 0) / 100);
        const dailyInterest = diasAtraso > 0 && dailyRate > 0 ? Number(emprestimo.valor_principal) * dailyRate * diasAtraso : 0;
        valorPendente = mensal + dailyInterest;
      }

      const doc = new jsPDF();
      // Helpers to wrap and paginate
      const maxY = 290;
      const lineHeight = 5;
      const ensurePage = (add = 0) => {
        if (y + add > maxY) {
          doc.addPage();
          y = 20;
        }
      };
       const writeWrapped = (label: string, value: string, x = 14, maxWidth = 180) => {
         const text = label ? `${label} ${value || '-'}` : (value || '-');
         const lines = doc.splitTextToSize(text, maxWidth);
         lines.forEach((ln: string) => {
           ensurePage(lineHeight);
           doc.setTextColor(0, 0, 0); // Cor preta explícita
           doc.text(ln, x, y);
           y += lineHeight;
         });
       };

      // Header
      doc.setDrawColor(230);
      doc.setFillColor(245, 247, 250);
      doc.rect(10, 10, 190, 18, 'F');
      doc.setFontSize(16);
      // Logo (se disponível)
      if (systemConfig.logo_url) {
        try {
          const logoHref = `${systemConfig.logo_url}${systemConfig.logo_url.includes('?') ? '&' : '?'}v=${encodeURIComponent(systemConfig.updated_at || '')}`;
          const resp = await fetch(logoHref, { mode: 'cors' });
          const blob = await resp.blob();
          const reader = new FileReader();
          const dataUrl: string = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          
          // Criar uma imagem temporária para obter dimensões originais
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = () => {
              const aspectRatio = img.width / img.height;
              const maxWidth = 25;
              const maxHeight = 15;
              
              let logoWidth = maxWidth;
              let logoHeight = maxWidth / aspectRatio;
              
              // Se a altura calculada for maior que o máximo, ajustar pela altura
              if (logoHeight > maxHeight) {
                logoHeight = maxHeight;
                logoWidth = maxHeight * aspectRatio;
              }
              
              doc.addImage(dataUrl, 'PNG', 12, 12, logoWidth, logoHeight);
              resolve(true);
            };
            img.onerror = reject;
            img.src = dataUrl;
          });
        } catch (e) { 
          console.log('Erro ao carregar logo:', e);
        }
      }
       const titulo = parcelaEspecifica 
         ? `Comprovante de Vencimento - Parcela ${parcelaEspecifica.numero_parcela}`
         : 'Comprovante de Vencimento';
       doc.setTextColor(0, 0, 0); // Cor preta explícita
       doc.text(titulo, 105, 22, { align: 'center' });

      // Dados principais (box) - Layout redesenhado
      let y = 40;
      doc.setDrawColor(200);
      doc.rect(10, y - 8, 190, 70); // Aumentar altura da caixa
      doc.setFontSize(12);
      const pick = (obj: any, keys: string[]) => {
        for (const k of keys) {
          if (obj && obj[k] && String(obj[k]).trim().length > 0) return String(obj[k]);
        }
        return '';
      };
      const rua = pick(clienteInfo || {}, ['endereco','logradouro','rua']);
      const numero = pick(clienteInfo || {}, ['numero','número']);
      const bairro = pick(clienteInfo || {}, ['bairro']);
      const cidade = pick(clienteInfo || {}, ['cidade']);
      const estado = pick(clienteInfo || {}, ['estado','uf']);
      const cep = pick(clienteInfo || {}, ['cep']);
      const telefoneCli = pick(clienteInfo || {}, ['telefone','celular','telefone1']);
      const documentoCli = pick(clienteInfo || {}, ['cpf','cnpj','documento']);
      const enderecoCompleto = [
        [rua, numero].filter(Boolean).join(', '),
        bairro,
        [cidade, estado].filter(Boolean).join(' - '),
        cep
      ].filter(Boolean).join(' | ');

      writeWrapped('Cliente:', `${emprestimo.clientes?.nome || ''}`, 14, 180);
      writeWrapped('CPF/CNPJ:', documentoCli || '-', 14, 180);
      writeWrapped('Endereço:', enderecoCompleto || '-', 14, 180);
      writeWrapped('Telefone:', telefoneCli || '-', 14, 180);
      
      if (parcelaEspecifica) {
        writeWrapped('Parcela:', `${parcelaEspecifica.numero_parcela}`, 14, 180);
        writeWrapped('Valor da Parcela:', `R$ ${Number(parcelaEspecifica.valor_parcela).toFixed(2)}`, 14, 180);
        writeWrapped('Vencimento:', `${formatDate(parcelaEspecifica.data_vencimento)}`, 14, 180);
        writeWrapped('Status:', `${parcelaEspecifica.status || 'pendente'}`, 14, 180);
       } else {
         writeWrapped('Valor do Empréstimo:', `R$ ${Number(emprestimo.valor_principal).toFixed(2)}`, 14, 180);
         writeWrapped('Data do Empréstimo:', `${formatDate(emprestimo.data_emprestimo)}`, 14, 180);
         writeWrapped('Vencimento:', `${formatDate(emprestimo.data_vencimento)}`, 14, 180);
         writeWrapped('Juros Mensal:', `${Number(emprestimo.taxa_juros_mensal || 0)}%`, 14, 180);
         writeWrapped('Juros Diário (Atraso):', `${Number((emprestimo as any).taxa_juros_diaria_atraso || 0).toFixed(2)}%`, 14, 180);
       }

      // Valor pendente em destaque - Ajustar posicionamento
      ensurePage(30);
      y += 5; // Adicionar espaço extra antes da tarja
      
      doc.setDrawColor(220);
      doc.setFillColor(254, 242, 242);
      doc.rect(10, y - 8, 190, 22, 'F');
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      
      if (parcelaEspecifica) {
        const vencParcela = new Date(parcelaEspecifica.data_vencimento);
        const diasAtrasoParcela = Math.max(0, Math.floor((hoje.getTime() - vencParcela.getTime()) / (1000 * 60 * 60 * 24)));
        doc.text(`Dias em atraso: ${diasAtrasoParcela}`, 14, y);
      } else {
        doc.text(`Dias em atraso: ${diasAtraso}`, 14, y);
      }
      
      doc.setFontSize(16);
      doc.setTextColor(220, 38, 38);
      doc.text(`VALOR PENDENTE: R$ ${valorPendente.toFixed(2)}`, 105, y + 8, { align: 'center' });
      y += 25;

      if (emprestimo.parcelado && !parcelaEspecifica) {
        // Tabela de parcelas (apenas se não for parcela específica)
        doc.setFontSize(13);
        doc.setTextColor(0, 0, 0); // Cor preta explícita
        ensurePage(10);
        doc.text('Parcelas', 14, y); y += 4;
        // Cabeçalho
        doc.setDrawColor(200);
        ensurePage(10);
        doc.rect(10, y, 190, 8);
        doc.setFontSize(11);
        doc.text('Parcela', 14, y + 5);
        doc.text('Valor (R$)', 44, y + 5);
        doc.text('Vencimento', 90, y + 5);
        doc.text('Status', 130, y + 5);
        doc.text('Juro Diário', 160, y + 5);
        y += 10;
        parcelasLista.forEach((p) => {
          ensurePage(8);
          const base = Number(p.valor_parcela || 0);
          const vencParc = new Date(p.data_vencimento);
          const dias = Math.max(0, Math.floor((new Date().getTime() - vencParc.getTime()) / (1000 * 60 * 60 * 24)));
          const taxaDiaria = Number((emprestimo as any).taxa_juros_diaria_atraso || 0) / 100;
          const daily = dias > 0 && taxaDiaria > 0 ? base * taxaDiaria * dias : 0;
          doc.setTextColor(0, 0, 0); // Cor preta explícita
          doc.text(`#${p.numero_parcela}`, 14, y);
          doc.text(`${base.toFixed(2)}`, 44, y);
          doc.text(`${formatDate(p.data_vencimento)}`, 90, y);
          // limitar status a 12 chars para não invadir coluna
          const statusTxt = String(p.status || '').slice(0, 12);
          doc.text(statusTxt, 130, y);
          doc.text(`${daily.toFixed(2)}`, 160, y);
          y += 6;
        });
        y += 2;
      }

      if (admin?.pix_key) {
        // Seção de pagamento (Pix)
        doc.setFontSize(13);
        doc.setTextColor(0, 0, 0); // Cor preta explícita
        ensurePage(60);
        doc.text('Pagamento via Pix', 14, y); y += 4;
        doc.setDrawColor(220);
        doc.rect(10, y, 190, 50);
        doc.setFontSize(11);
        const chaveLine = `Chave (${admin.pix_tipo || 'pix'}): ${admin.pix_key}`;
        const chaveLines = doc.splitTextToSize(chaveLine, 140);
        chaveLines.forEach((ln: string, i: number) => {
          doc.setTextColor(0, 0, 0); // Cor preta explícita
          doc.text(ln, 14, y + 10 + i * lineHeight);
        });
        const toDataURL = (qrm as any).toDataURL || (qrm as any).default?.toDataURL;
        const qrDataUrl = await toDataURL(admin.pix_key);
        doc.addImage(qrDataUrl, 'PNG', 150, y + 5, 40, 40);
        y += 56;
      }

      // Rodapé
      ensurePage(10);
      doc.setDrawColor(240);
      doc.line(10, 290, 200, 290);
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0); // Cor preta explícita
      doc.text('Documento gerado automaticamente pelo sistema.', 105, 295, { align: 'center' });

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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              // Buscar administradores com chaves Pix
                              const { data: adminData, error } = await supabase
                                .from('profiles')
                                .select('id, nome, pix_key, pix_tipo')
                                .eq('role', 'admin');
                              
                              if (error) {
                                console.log('Erro ao buscar admins:', error);
                                // Fallback: buscar apenas id e nome se houver erro
                                const { data: fallbackData } = await supabase
                                  .from('profiles')
                                  .select('id, nome')
                                  .eq('role', 'admin');
                                
                                const adminsFormatted = (fallbackData || []).map(admin => ({
                                  id: admin.id,
                                  nome: admin.nome,
                                  pix_key: 'Chave Pix não configurada - Configure em Usuários',
                                  pix_tipo: 'pix'
                                }));
                                
                                setAdmins(adminsFormatted);
                                setSelectedAdminId((adminsFormatted && adminsFormatted[0]?.id) || "");
                              } else {
                                // Usar dados reais das chaves Pix
                                const adminsFormatted = (adminData || []).map(admin => ({
                                  id: admin.id,
                                  nome: admin.nome,
                                  pix_key: admin.pix_key || 'Chave Pix não configurada - Configure em Usuários',
                                  pix_tipo: admin.pix_tipo || 'pix'
                                }));
                                
                                setAdmins(adminsFormatted);
                                setSelectedAdminId((adminsFormatted && adminsFormatted[0]?.id) || "");
                              }
                              setSelectedEmprestimo(emprestimo);
                              setExportDialogOpen(true);
                            }}
                          >
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
                    <TableHead>Ações</TableHead>
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
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportarPDF(selectedEmprestimo!, parcela)}
                          className="h-8 w-8 p-0"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
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
        {/* Dialog para exportação em PDF com seleção de administrador (chave Pix) */}
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Exportar Comprovante de Vencimento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Administrador (chave Pix)</Label>
                <Select value={selectedAdminId} onValueChange={setSelectedAdminId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um administrador" />
                  </SelectTrigger>
                  <SelectContent>
                    {admins.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {(a.nome || 'Administrador')} {a.pix_tipo && a.pix_key ? `- ${a.pix_tipo}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {admins.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">Nenhum administrador com chave Pix encontrado.</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setExportDialogOpen(false)}>Cancelar</Button>
                <Button
                  onClick={async () => {
                    if (!selectedEmprestimo) return;
                    await exportarPDF(selectedEmprestimo);
                    setExportDialogOpen(false);
                  }}
                  disabled={!selectedEmprestimo || !selectedAdminId}
                >
                  Exportar PDF
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default EmprestimosNew;
