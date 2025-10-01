import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SystemConfig {
  system_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
}

const defaultConfig: SystemConfig = {
  system_name: 'Flow Lend',
  logo_url: null,
  favicon_url: null,
  primary_color: '#3b82f6',
  secondary_color: '#64748b',
};

// Cache global para evitar recarregamentos desnecessários
let configCache: SystemConfig | null = null;
let configCacheTime: number = 0;
const CACHE_DURATION = 30 * 1000; // 30 segundos (reduzido para testes)

// Função para verificar se temos cache válido
export const hasValidCache = (): boolean => {
  return configCache !== null && Date.now() - configCacheTime < CACHE_DURATION;
};

export const useSystemConfig = () => {
  const [config, setConfig] = useState<SystemConfig>(() => {
    // Se temos cache válido, usar ele imediatamente
    if (configCache && Date.now() - configCacheTime < CACHE_DURATION) {
      return configCache;
    }
    return defaultConfig;
  });
  const [loading, setLoading] = useState(() => {
    // Se temos cache válido, não precisamos carregar
    return !(configCache && Date.now() - configCacheTime < CACHE_DURATION);
  });
  const [ready, setReady] = useState(() => {
    // Se temos cache válido, estamos prontos imediatamente
    return configCache && Date.now() - configCacheTime < CACHE_DURATION;
  });

  const loadConfig = useCallback(async () => {
    try {
      console.log('🔄 Carregando configurações do sistema...');
      
      // Se já temos cache válido, não recarregar
      if (configCache && Date.now() - configCacheTime < CACHE_DURATION) {
        console.log('📋 Usando cache válido:', configCache);
        setConfig(configCache);
        setLoading(false);
        setReady(true);
        return;
      }

      console.log('🌐 Buscando configurações no banco...');
      const { data, error } = await supabase.rpc('get_system_config');
      
      if (error) {
        console.error('❌ Erro ao buscar configurações:', error);
        console.error('❌ Detalhes do erro RPC:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('📊 Dados recebidos do RPC:', data);
      console.log('📊 Tipo dos dados:', typeof data);
      console.log('📊 É array?', Array.isArray(data));
      console.log('📊 Tamanho do array:', data ? data.length : 'null');
      
      const newConfig = data && data.length > 0 ? data[0] : defaultConfig;
      console.log('⚙️ Configuração final:', newConfig);
      console.log('🖼️ Logo URL na configuração:', newConfig.logo_url);
      console.log('🎨 Favicon URL na configuração:', newConfig.favicon_url);
      console.log('📝 Nome do sistema na configuração:', newConfig.system_name);
      
      // Atualizar cache
      configCache = newConfig;
      configCacheTime = Date.now();
      
      setConfig(newConfig);
      setReady(true);
      
      // Aplicar favicon imediatamente se disponível
      if (newConfig.favicon_url) {
        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (favicon && favicon.href !== newConfig.favicon_url) {
          favicon.href = newConfig.favicon_url;
          console.log('🎨 Favicon aplicado:', newConfig.favicon_url);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error);
      setConfig(defaultConfig);
      setReady(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = async (newConfig: Partial<SystemConfig>) => {
    try {
      console.log('🔄 Iniciando atualização de configurações globais:', newConfig);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }

      console.log('👤 Usuário autenticado:', user.id);

      // Usar a função RPC para salvar configuração global
      const configToSave = {
        p_system_name: newConfig.system_name || 'Flow Lend',
        p_logo_url: newConfig.logo_url || null,
        p_favicon_url: newConfig.favicon_url || null,
        p_primary_color: newConfig.primary_color || '#3b82f6',
        p_secondary_color: newConfig.secondary_color || '#64748b'
      };
      
      console.log('🚀 Enviando para save_system_config:', configToSave);
      
      const { data, error } = await supabase.rpc('save_system_config', configToSave);

      console.log('📤 Resposta do RPC save_system_config:', { data, error });

      if (error) {
        console.error('❌ Erro ao salvar configuração global:', error);
        console.error('❌ Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('✅ Configuração global salva com sucesso, data:', data);

      // Invalidar cache e recarregar configurações
      console.log('🔄 Invalidando cache e recarregando...');
      configCache = null;
      configCacheTime = 0;
      
      // Forçar recarregamento completo
      await loadConfig();
      
      console.log('✅ Configurações globais salvas e recarregadas do Supabase');
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar configurações globais:', error);
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
  }, []);

  const clearCache = () => {
    configCache = null;
    configCacheTime = 0;
    console.log('🗑️ Cache limpo manualmente');
  };

  const forceReload = async () => {
    console.log('🔄 Forçando recarregamento completo...');
    configCache = null;
    configCacheTime = 0;
    setLoading(true);
    await loadConfig();
  };

  return {
    config,
    loading,
    ready,
    updateConfig,
    uploadFile,
    reloadConfig: loadConfig,
    clearCache,
    forceReload,
  };
};
