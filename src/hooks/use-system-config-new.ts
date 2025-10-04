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
  system_name: '',
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
      
      // 1) Tentar leitura direta da tabela (mais confiável para depuração)
      const tableRes = await supabase
        .from('system_config')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!tableRes.error && tableRes.data) {
        console.log('📊 Dados recebidos (tabela):', tableRes.data);
        setConfig(tableRes.data as any);
      } else {
        // 2) Fallback para RPC
        const { data, error } = await supabase.rpc('get_system_config');
        if (error) {
          console.error('❌ Erro ao buscar configurações (RPC):', error);
          throw error;
        }
        console.log('📊 Dados recebidos (RPC):', data);
        if (data && data.length > 0) {
          const newConfig = data[0];
          console.log('✅ Configuração carregada (RPC):', newConfig);
          setConfig(newConfig);
        } else {
          console.log('⚠️ Nenhuma configuração encontrada, usando padrão');
          setConfig(defaultConfig);
        }
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

  // Ouvir eventos globais de atualização para sincronizar entre instâncias do hook
  useEffect(() => {
    const handleUpdated = () => {
      loadConfig();
    };
    window.addEventListener('system-config-updated', handleUpdated as EventListener);
    return () => window.removeEventListener('system-config-updated', handleUpdated as EventListener);
  }, [loadConfig]);

  // Aplicar favicon dinamicamente com cache-busting
  useEffect(() => {
    if (!config.favicon_url) return;
    const href = `${config.favicon_url}${config.favicon_url.includes('?') ? '&' : '?'}v=${encodeURIComponent(config.updated_at || '')}`;

    const ensureLink = (rel: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = rel as any;
        document.head.appendChild(link);
      }
      if (link.href !== href) {
        link.href = href;
        link.type = 'image/x-icon';
      }
    };

    ensureLink('icon');
    ensureLink('shortcut icon');
  }, [config.favicon_url, config.updated_at]);

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

      // Otimismo: atualiza localmente para refletir imediatamente
      setConfig((prev) => ({
        ...prev,
        system_name: configToSave.p_system_name ?? prev.system_name,
        logo_url: configToSave.p_logo_url ?? prev.logo_url,
        favicon_url: configToSave.p_favicon_url ?? prev.favicon_url,
        primary_color: configToSave.p_primary_color ?? prev.primary_color,
        secondary_color: configToSave.p_secondary_color ?? prev.secondary_color,
        updated_at: new Date().toISOString(),
      }));

      // Em seguida, recarrega do Supabase (leitura direta) para garantir consistência
      const refreshed = await supabase
        .from('system_config')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!refreshed.error && refreshed.data) {
        setConfig(refreshed.data as any);
      } else {
        await loadConfig();
      }

      // Notificar outras instâncias/partes da aplicação
      window.dispatchEvent(new Event('system-config-updated'));
      
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
