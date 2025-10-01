import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, AlertCircle, Clock, Users, Calendar } from "lucide-react";

interface DashboardStats {
  totalEmprestado: number;
  totalReceber: number;
  emprestimosVencidos: number;
  emprestimosAVencer: number;
}

interface ClientePendente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  valor_pendente: number;
  valor_mensal: number;
  pagamentos_pendentes: number;
  data_vencimento: string;
  dias_atraso: number;
  status: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmprestado: 0,
    totalReceber: 0,
    emprestimosVencidos: 0,
    emprestimosAVencer: 0,
  });
  const [clientesPendentes, setClientesPendentes] = useState<ClientePendente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Buscar empréstimos
      const { data: emprestimos, error: emprestimosError } = await supabase
        .from("emprestimos")
        .select(`
          id,
          cliente_id,
          valor_principal,
          data_emprestimo,
          data_vencimento,
          status,
          taxa_juros_mensal,
          dias_atraso,
          clientes!inner (
            id,
            nome,
            cpf,
            telefone
          )
        `)
        .in('status', ['ativo', 'parcial', 'vencido']);

      if (emprestimosError) throw emprestimosError;

      // Buscar pagamentos uma única vez
      const { data: pagamentos, error: pagamentosError } = await supabase
        .from("pagamentos")
        .select("emprestimo_id, valor_pago");

      if (pagamentosError) throw pagamentosError;

      if (emprestimos) {
        const hoje = new Date();
        const proximos7Dias = new Date();
        proximos7Dias.setDate(hoje.getDate() + 7);

        // Calcular estatísticas do dashboard
        const totalEmprestado = emprestimos.reduce((sum, emp) => {
          if (emp.status === 'ativo' || emp.status === 'parcial' || emp.status === 'vencido') {
            return sum + Number(emp.valor_principal);
          }
          return sum;
        }, 0);

        const totalReceber = emprestimos.reduce((sum, emp) => {
          if (emp.status === 'ativo' || emp.status === 'parcial' || emp.status === 'vencido') {
            const pagamentosDoEmprestimo = pagamentos?.filter(p => p.emprestimo_id === emp.id) || [];
            const totalPago = pagamentosDoEmprestimo.reduce((sum, p) => sum + Number(p.valor_pago), 0);
            
            // Usar a mesma lógica de cálculo de valor pendente
            const { valorPendente } = calcularValorPendente(
              Number(emp.valor_principal),
              Number(emp.taxa_juros_mensal || 0),
              emp.data_emprestimo,
              emp.data_vencimento,
              totalPago
            );
            
            return sum + valorPendente;
          }
          return sum;
        }, 0);

        const emprestimosVencidos = emprestimos.filter(emp => {
          if (emp.status === 'ativo' || emp.status === 'parcial') {
            const vencimento = new Date(emp.data_vencimento);
            return vencimento < hoje;
          }
          return false;
        }).length;

        const emprestimosAVencer = emprestimos.filter(emp => {
          if (emp.status === 'ativo' || emp.status === 'parcial') {
            const vencimento = new Date(emp.data_vencimento);
            return vencimento >= hoje && vencimento <= proximos7Dias;
          }
          return false;
        }).length;

        setStats({
          totalEmprestado,
          totalReceber,
          emprestimosVencidos,
          emprestimosAVencer,
        });

        // Calcular clientes pendentes
        const clientesComPendencias: ClientePendente[] = emprestimos.map(emp => {
          const pagamentosDoEmprestimo = pagamentos?.filter(p => p.emprestimo_id === emp.id) || [];
          const totalPago = pagamentosDoEmprestimo.reduce((sum, p) => sum + Number(p.valor_pago), 0);
          
          // Calcular valor pendente usando a nova lógica
          const { valorPendente, valorMensal, pagamentosPendentes } = calcularValorPendente(
            Number(emp.valor_principal),
            Number(emp.taxa_juros_mensal || 0),
            emp.data_emprestimo,
            emp.data_vencimento,
            totalPago
          );

          // Calcular dias de atraso
          const vencimento = new Date(emp.data_vencimento);
          const diasAtraso = Math.max(0, Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24)));

          return {
            id: emp.cliente_id,
            nome: emp.clientes.nome,
            cpf: emp.clientes.cpf,
            telefone: emp.clientes.telefone,
            valor_pendente: valorPendente,
            valor_mensal: valorMensal,
            pagamentos_pendentes: pagamentosPendentes,
            data_vencimento: emp.data_vencimento,
            dias_atraso: diasAtraso,
            status: emp.status || 'ativo'
          };
        }).filter(cliente => cliente.valor_pendente > 0); // Apenas clientes com valor pendente

        // Ordenar por dias de atraso (mais atrasados primeiro)
        clientesComPendencias.sort((a, b) => b.dias_atraso - a.dias_atraso);

        setClientesPendentes(clientesComPendencias);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };


  /**
   * Calcula o valor pendente seguindo a nova lógica:
   * - Cliente pega R$ 1.000,00
   * - Deve pagar R$ 1.300,00 no próximo mês (principal + juros)
   * - Se pagar R$ 300,00, ainda deve R$ 1.000,00 (principal não é abatido)
   * - No próximo mês deve pagar R$ 1.300,00 novamente
   */
  const calcularValorPendente = (
    valorPrincipal: number,
    taxaJurosMensal: number,
    dataEmprestimo: string,
    dataVencimento: string,
    totalPago: number
  ): { valorPendente: number; valorMensal: number; pagamentosPendentes: number } => {
    const hoje = new Date();
    const dataInicio = new Date(dataEmprestimo);
    const dataVenc = new Date(dataVencimento);
    
    // Valor que deveria ser pago por mês (principal + juros)
    const valorMensal = valorPrincipal + (valorPrincipal * (taxaJurosMensal / 100));
    
    // Calcular quantos meses se passaram desde o vencimento
    const mesesAtraso = Math.max(0, Math.floor((hoje.getTime() - dataVenc.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    
    // Se ainda não venceu, o valor pendente é apenas o valor mensal
    if (hoje < dataVenc) {
      return { 
        valorPendente: valorMensal, 
        valorMensal, 
        pagamentosPendentes: 1 
      };
    }
    
    // Se venceu, calcular quantos pagamentos mensais estão em atraso
    const pagamentosEmAtraso = mesesAtraso + 1; // +1 porque conta o mês de vencimento
    
    // Valor total que deveria ter sido pago até agora
    const valorTotalDevido = valorMensal * pagamentosEmAtraso;
    
    // O valor pendente é a diferença entre o que deveria ter sido pago e o que foi pago
    // Mas nunca pode ser menor que o valor mensal (pelo menos um pagamento mensal está pendente)
    const valorPendente = Math.max(valorMensal, valorTotalDevido - totalPago);
    
    // Calcular quantos pagamentos mensais estão pendentes
    const pagamentosPendentes = Math.ceil(valorPendente / valorMensal);
    
    return { valorPendente, valorMensal, pagamentosPendentes };
  };


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string, diasAtraso: number) => {
    if (diasAtraso > 0) {
      return <Badge variant="destructive">Em Atraso ({diasAtraso} dias)</Badge>;
    } else if (status === 'parcial') {
      return <Badge variant="secondary">Pagamento Parcial</Badge>;
    } else {
      return <Badge variant="default">Em Dia</Badge>;
    }
  };

  const statCards = [
    {
      title: "Total Emprestado",
      value: formatCurrency(stats.totalEmprestado),
      icon: DollarSign,
      description: "Capital em circulação",
      color: "text-primary"
    },
    {
      title: "Total a Receber",
      value: formatCurrency(stats.totalReceber),
      icon: TrendingUp,
      description: "Principal + juros",
      color: "text-success"
    },
    {
      title: "Clientes Pendentes",
      value: clientesPendentes.length,
      icon: Users,
      description: "Com pagamentos em aberto",
      color: "text-orange-600"
    },
    {
      title: "Em Atraso",
      value: clientesPendentes.filter(c => c.dias_atraso > 0).length,
      icon: AlertCircle,
      description: "Requerem atenção urgente",
      color: "text-destructive"
    },
  ];

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="shadow-card hover:shadow-elevated transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${card.color}`}>
                    {loading ? "..." : card.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Lista de Clientes Pendentes */}
        {clientesPendentes.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Clientes com Pagamentos Pendentes
              </CardTitle>
              <div className="text-sm text-muted-foreground mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <strong>Lógica de Cálculo:</strong> Se um cliente pega R$ 1.000,00 emprestado, deve pagar R$ 1.300,00 por mês (principal + juros). 
                Se pagar apenas R$ 300,00, ainda deve o valor mensal completo (R$ 1.300,00) no próximo mês. 
                Os pagamentos parciais não abatem o valor principal.
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientesPendentes.slice(0, 10).map((cliente) => (
                  <div key={cliente.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{cliente.nome}</h3>
                        {getStatusBadge(cliente.status, cliente.dias_atraso)}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">CPF:</span> {cliente.cpf}
                        </div>
                        <div>
                          <span className="font-medium">Telefone:</span> {cliente.telefone}
                        </div>
                        <div>
                          <span className="font-medium">Vencimento:</span> {formatDate(cliente.data_vencimento)}
                        </div>
                        <div>
                          <span className="font-medium">Pagamentos Pendentes:</span> {cliente.pagamentos_pendentes}
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                        <span className="font-medium">Valor Mensal:</span> {formatCurrency(cliente.valor_mensal)} | 
                        <span className="font-medium ml-2">Total Pendente:</span> {formatCurrency(cliente.valor_pendente)}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-xl sm:text-2xl font-bold text-primary">
                        {formatCurrency(cliente.valor_pendente)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Valor Pendente
                      </div>
                    </div>
                  </div>
                ))}
                {clientesPendentes.length > 10 && (
                  <div className="text-center text-muted-foreground py-4">
                    E mais {clientesPendentes.length - 10} clientes...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Bem-vindo ao Sistema de Gestão de Empréstimos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Use o menu lateral para navegar entre as funcionalidades:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                <strong>Clientes:</strong> Cadastre e gerencie seus clientes
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                <strong>Empréstimos:</strong> Crie e acompanhe empréstimos com cálculo automático de juros
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                <strong>Pagamentos:</strong> Registre pagamentos totais ou parciais
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
