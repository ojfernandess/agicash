import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Emprestimo {
  id: string;
  cliente_id: string;
  valor_principal: number;
  taxa_juros_mensal: number;
  taxa_juros_diaria_atraso?: number;
  juros_diarios_calculados?: number;
  dias_atraso?: number;
  data_ultimo_calculo?: string;
  data_emprestimo: string;
  data_vencimento: string;
  status: string;
  clientes: {
    nome: string;
  };
}

interface Cliente {
  id: string;
  nome: string;
}

const Emprestimos = () => {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    cliente_id: "",
    valor_principal: "",
    taxa_juros_mensal: "30",
    taxa_juros_diaria_atraso: "0.05",
    data_emprestimo: new Date().toISOString().split("T")[0],
    data_vencimento: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("emprestimos").insert({
        user_id: user.id,
        cliente_id: formData.cliente_id,
        valor_principal: parseFloat(formData.valor_principal),
        taxa_juros_mensal: parseFloat(formData.taxa_juros_mensal),
        taxa_juros_diaria_atraso: parseFloat(formData.taxa_juros_diaria_atraso),
        data_emprestimo: formData.data_emprestimo,
        data_vencimento: formData.data_vencimento,
      });

      if (error) throw error;

      toast({
        title: "Empréstimo criado!",
        description: "O empréstimo foi registrado com sucesso.",
      });

      setDialogOpen(false);
      setFormData({
        cliente_id: "",
        valor_principal: "",
        taxa_juros_mensal: "30",
        taxa_juros_diaria_atraso: "0.05",
        data_emprestimo: new Date().toISOString().split("T")[0],
        data_vencimento: "",
      });
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar empréstimo",
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
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "ativo": return "default";
      case "pago": return "secondary";
      case "vencido": return "destructive";
      default: return "outline";
    }
  };

  const calcularJuros = async () => {
    try {
      const { error } = await supabase.rpc('calcular_juros_diarios');
      
      if (error) throw error;

      toast({
        title: "Juros calculados!",
        description: "Os juros diários foram calculados e atualizados.",
      });

      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao calcular juros",
        description: error.message,
      });
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Empréstimos</h1>
            <p className="text-muted-foreground">Gerencie seus empréstimos</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={calcularJuros} className="w-full sm:w-auto">
              <Calculator className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Calcular Juros</span>
              <span className="sm:hidden">Calcular</span>
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Novo Empréstimo</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4">
              <DialogHeader>
                <DialogTitle>Criar Novo Empréstimo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cliente_id">Cliente *</Label>
                  <Select
                    value={formData.cliente_id}
                    onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
                    required
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
                <div className="space-y-2">
                  <Label htmlFor="valor_principal">Valor do Empréstimo *</Label>
                  <Input
                    id="valor_principal"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor_principal}
                    onChange={(e) => setFormData({ ...formData, valor_principal: e.target.value })}
                    placeholder="1000.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxa_juros_mensal">Taxa de Juros Mensal (%) *</Label>
                  <Input
                    id="taxa_juros_mensal"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.taxa_juros_mensal}
                    onChange={(e) => setFormData({ ...formData, taxa_juros_mensal: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Padrão: 30% ao mês</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxa_juros_diaria_atraso">Taxa de Juros Diária em Atraso (%) *</Label>
                  <Input
                    id="taxa_juros_diaria_atraso"
                    type="number"
                    step="0.000001"
                    min="0"
                    max="1"
                    value={formData.taxa_juros_diaria_atraso}
                    onChange={(e) => setFormData({ ...formData, taxa_juros_diaria_atraso: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Padrão: 0.05 (5% ao dia)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_emprestimo">Data do Empréstimo *</Label>
                  <Input
                    id="data_emprestimo"
                    type="date"
                    value={formData.data_emprestimo}
                    onChange={(e) => setFormData({ ...formData, data_emprestimo: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
                  <Input
                    id="data_vencimento"
                    type="date"
                    value={formData.data_vencimento}
                    onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                    required
                  />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Cálculo Estimado:</p>
                  {formData.valor_principal && formData.taxa_juros_mensal && (
                    <>
                      <p className="text-xs text-muted-foreground">
                        Juros: {formatCurrency(parseFloat(formData.valor_principal) * (parseFloat(formData.taxa_juros_mensal) / 100))}
                      </p>
                      <p className="text-xs font-medium">
                        Total: {formatCurrency(parseFloat(formData.valor_principal) * (1 + parseFloat(formData.taxa_juros_mensal) / 100))}
                      </p>
                    </>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  Criar Empréstimo
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Lista de Empréstimos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : emprestimos.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum empréstimo cadastrado ainda
              </p>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Valor Principal</TableHead>
                        <TableHead>Taxa Juros</TableHead>
                        <TableHead>Data Empréstimo</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Dias Atraso</TableHead>
                        <TableHead>Juros Calculados</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emprestimos.map((emprestimo) => (
                        <TableRow key={emprestimo.id}>
                          <TableCell className="font-medium">{emprestimo.clientes.nome}</TableCell>
                          <TableCell>{formatCurrency(emprestimo.valor_principal)}</TableCell>
                          <TableCell>{emprestimo.taxa_juros_mensal}%</TableCell>
                          <TableCell>{formatDate(emprestimo.data_emprestimo)}</TableCell>
                          <TableCell>{formatDate(emprestimo.data_vencimento)}</TableCell>
                          <TableCell>
                            {emprestimo.dias_atraso ? `${emprestimo.dias_atraso} dias` : "-"}
                          </TableCell>
                          <TableCell>
                            {emprestimo.juros_diarios_calculados ? 
                              formatCurrency(emprestimo.juros_diarios_calculados) : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(emprestimo.status)}>
                              {emprestimo.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {emprestimos.map((emprestimo) => (
                    <Card key={emprestimo.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{emprestimo.clientes.nome}</h3>
                          <Badge variant={getStatusVariant(emprestimo.status)}>
                            {emprestimo.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Valor</p>
                            <p className="font-medium">{formatCurrency(emprestimo.valor_principal)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Taxa</p>
                            <p className="font-medium">{emprestimo.taxa_juros_mensal}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Empréstimo</p>
                            <p className="font-medium">{formatDate(emprestimo.data_emprestimo)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Vencimento</p>
                            <p className="font-medium">{formatDate(emprestimo.data_vencimento)}</p>
                          </div>
                          {emprestimo.dias_atraso && (
                            <div>
                              <p className="text-muted-foreground">Dias Atraso</p>
                              <p className="font-medium text-red-600">{emprestimo.dias_atraso} dias</p>
                            </div>
                          )}
                          {emprestimo.juros_diarios_calculados && (
                            <div>
                              <p className="text-muted-foreground">Juros</p>
                              <p className="font-medium text-red-600">
                                {formatCurrency(emprestimo.juros_diarios_calculados)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Emprestimos;
