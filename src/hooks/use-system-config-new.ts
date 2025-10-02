import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SystemConfig {
  id: string;
  system_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  created_at: string;
  updated_at: string;
}

const defaultConfig: SystemConfig = {
  id: '',
  system_name: 'Flow Lend',
  logo_url: null,
  favicon_url: null,
  primary_color: '#3b82f6',
  secondary_color: '#64748b',
  created_at: '',
  updated_at: '',
};

export const useSystemConfig = () => {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const loadConfig = useCallback(async () => {
    try {
      console.log('🔄 Carregando configurações do sistema...');
      setLoading(true);
      
      const { data, error } = await supabase.rpc('get_system_config');
      
      if (error) {
        console.error('❌ Erro ao buscar configurações:', error);
        throw error;
      }
      
      console.log('📊 Dados recebidos:', data);
      
      if (data && data.length > 0) {
        const newConfig = data[0];
        console.log('✅ Configuração carregada:', newConfig);
        setConfig(newConfig);
      } else {
        console.log('⚠️ Nenhuma configuração encontrada, usando padrão');
        setConfig(defaultConfig);
      }
      
      setReady(true);
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error);
      setConfig(defaultConfig);
      setReady(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = async (newConfig: Partial<SystemConfig>): Promise<boolean> => {
    try {
      console.log('🔄 Salvando configurações:', newConfig);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ Usuário não autenticado');
        return false;
      }

      const configToSave = {
        p_system_name: newConfig.system_name || config.system_name || 'Flow Lend',
        p_logo_url: newConfig.logo_url !== undefined ? newConfig.logo_url : config.logo_url,
        p_favicon_url: newConfig.favicon_url !== undefined ? newConfig.favicon_url : config.favicon_url,
        p_primary_color: newConfig.primary_color || config.primary_color || '#3b82f6',
        p_secondary_color: newConfig.secondary_color || config.secondary_color || '#64748b'
      };
      
      console.log('🚀 Enviando para save_system_config:', configToSave);
      
      const { data, error } = await supabase.rpc('save_system_config', configToSave);

      if (error) {
        console.error('❌ Erro ao salvar:', error);
        return false;
      }

      console.log('✅ Configuração salva com sucesso');
      
      // Recarregar configurações
      await loadConfig();
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar configurações:', error);
      return false;
    }
  };

  const uploadFile = async (file: File, type: 'logo' | 'favicon'): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${Date.now()}.${fileExt}`;
      const filePath = `system-assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('system-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('system-assets')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      return null;
    }
  };

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loading,
    ready,
    updateConfig,
    uploadFile,
    reloadConfig: loadConfig,
  };
};
