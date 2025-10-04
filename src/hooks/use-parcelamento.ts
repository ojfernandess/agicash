import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Parcela, ParcelaDetalhada, ConfiguracaoParcelamento, EstatisticasParcelamento } from '@/types/parcelamento';

export const useParcelamento = () => {
  const [loading, setLoading] = useState(false);

  // Gerar parcelas para um empréstimo
  const gerarParcelas = useCallback(async (
    emprestimoId: string,
    configuracao: ConfiguracaoParcelamento
  ): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🔄 Gerando parcelas para empréstimo:', emprestimoId);
      console.log('📋 Configuração:', configuracao);

      const { data, error } = await supabase.rpc('gerar_parcelas', {
        p_emprestimo_id: emprestimoId,
        p_numero_parcelas: configuracao.numero_parcelas,
        p_valor_parcela: configuracao.valor_parcela,
        p_data_primeira_parcela: configuracao.data_primeira_parcela,
        p_intervalo_dias: configuracao.intervalo_pagamento
      });

      if (error) {
        console.error('❌ Erro ao gerar parcelas:', error);
        return false;
      }

      console.log('✅ Parcelas geradas com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao gerar parcelas:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar parcelas de um empréstimo
  const buscarParcelas = useCallback(async (emprestimoId: string): Promise<Parcela[]> => {
    try {
      setLoading(true);
      console.log('🔍 Buscando parcelas do empréstimo:', emprestimoId);

      const { data, error } = await supabase
        .from('parcelas')
        .select('*')
        .eq('emprestimo_id', emprestimoId)
        .order('numero_parcela');

      if (error) {
        console.error('❌ Erro ao buscar parcelas:', error);
        return [];
      }

      console.log('✅ Parcelas encontradas:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar parcelas:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar parcelas detalhadas (com informações do cliente)
  const buscarParcelasDetalhadas = useCallback(async (emprestimoId: string): Promise<ParcelaDetalhada[]> => {
    try {
      setLoading(true);
      console.log('🔍 Buscando parcelas detalhadas do empréstimo:', emprestimoId);

      const { data, error } = await supabase
        .from('parcelas_detalhadas')
        .select('*')
        .eq('emprestimo_id', emprestimoId)
        .order('numero_parcela');

      if (error) {
        console.error('❌ Erro ao buscar parcelas detalhadas:', error);
        return [];
      }

      console.log('✅ Parcelas detalhadas encontradas:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar parcelas detalhadas:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar status das parcelas
  const atualizarStatusParcelas = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🔄 Atualizando status das parcelas...');

      const { error } = await supabase.rpc('atualizar_status_parcelas');

      if (error) {
        console.error('❌ Erro ao atualizar status das parcelas:', error);
        return false;
      }

      console.log('✅ Status das parcelas atualizado');
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar status das parcelas:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calcular juros das parcelas
  const calcularJurosParcelas = useCallback(async (emprestimoId: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🔄 Calculando juros das parcelas do empréstimo:', emprestimoId);

      const { error } = await supabase.rpc('calcular_juros_parcelas', {
        p_emprestimo_id: emprestimoId
      });

      if (error) {
        console.error('❌ Erro ao calcular juros das parcelas:', error);
        return false;
      }

      console.log('✅ Juros das parcelas calculados');
      return true;
    } catch (error) {
      console.error('❌ Erro ao calcular juros das parcelas:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Registrar pagamento de parcela
  const registrarPagamentoParcela = useCallback(async (
    parcelaId: string,
    valorPago: number,
    dataPagamento: string,
    observacoes?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('💰 Registrando pagamento da parcela:', parcelaId);

      const { error } = await supabase
        .from('parcelas')
        .update({
          valor_pago: valorPago,
          data_pagamento: dataPagamento,
          status: valorPago > 0 ? 'pago' : 'pendente',
          observacoes: observacoes,
          updated_at: new Date().toISOString()
        })
        .eq('id', parcelaId);

      if (error) {
        console.error('❌ Erro ao registrar pagamento:', error);
        return false;
      }

      console.log('✅ Pagamento registrado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao registrar pagamento:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar estatísticas de parcelamento
  const buscarEstatisticasParcelamento = useCallback(async (emprestimoId: string): Promise<EstatisticasParcelamento | null> => {
    try {
      setLoading(true);
      console.log('📊 Buscando estatísticas de parcelamento:', emprestimoId);

      const { data, error } = await supabase
        .from('parcelas')
        .select('*')
        .eq('emprestimo_id', emprestimoId);

      if (error) {
        console.error('❌ Erro ao buscar estatísticas:', error);
        return null;
      }

      const parcelas = data || [];
      const estatisticas: EstatisticasParcelamento = {
        total_parcelas: parcelas.length,
        parcelas_pagas: parcelas.filter(p => p.status === 'pago').length,
        parcelas_pendentes: parcelas.filter(p => p.status === 'pendente').length,
        parcelas_atrasadas: parcelas.filter(p => p.status === 'atrasado').length,
        valor_total_pago: parcelas.reduce((sum, p) => sum + (p.valor_pago || 0), 0),
        valor_total_pendente: parcelas
          .filter(p => p.status === 'pendente')
          .reduce((sum, p) => sum + p.valor_parcela, 0),
        valor_total_atrasado: parcelas
          .filter(p => p.status === 'atrasado')
          .reduce((sum, p) => sum + p.valor_parcela + (p.juros_aplicados || 0), 0),
        proximo_vencimento: parcelas
          .filter(p => p.status === 'pendente')
          .sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime())[0]?.data_vencimento || null
      };

      console.log('✅ Estatísticas calculadas:', estatisticas);
      return estatisticas;
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    gerarParcelas,
    buscarParcelas,
    buscarParcelasDetalhadas,
    atualizarStatusParcelas,
    calcularJurosParcelas,
    registrarPagamentoParcela,
    buscarEstatisticasParcelamento
  };
};
