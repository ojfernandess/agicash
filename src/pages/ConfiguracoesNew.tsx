import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSystemConfig } from "@/hooks/use-system-config-new";
import { useToast } from "@/hooks/use-toast";
import { Save, Settings, Palette, Image } from "lucide-react";

const ConfiguracoesNew = () => {
  const { config, loading, ready, updateConfig, uploadFile } = useSystemConfig();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    system_name: '',
    primary_color: '#3b82f6',
    secondary_color: '#64748b',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  // Sincronizar formData com config quando carregado
  useEffect(() => {
    if (ready && config) {
      setFormData({
        system_name: config.system_name || 'Flow Lend',
        primary_color: config.primary_color || '#3b82f6',
        secondary_color: config.secondary_color || '#64748b',
      });
    }
  }, [config, ready]);

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('💾 Iniciando salvamento...');
      console.log('📝 FormData:', formData);
      console.log('⚙️ Config atual:', config);
      
      let logoUrl = config.logo_url;
      let faviconUrl = config.favicon_url;

      // Upload de arquivos se selecionados
      if (logoFile) {
        console.log('📤 Fazendo upload da logo...');
        logoUrl = await uploadFile(logoFile, 'logo');
        if (!logoUrl) {
          toast({
            variant: "destructive",
            title: "Erro no upload",
            description: "Não foi possível fazer upload da logo.",
          });
          return;
        }
        console.log('✅ Logo enviada:', logoUrl);
      }

      if (faviconFile) {
        console.log('📤 Fazendo upload do favicon...');
        faviconUrl = await uploadFile(faviconFile, 'favicon');
        if (!faviconUrl) {
          toast({
            variant: "destructive",
            title: "Erro no upload",
            description: "Não foi possível fazer upload do favicon.",
          });
          return;
        }
        console.log('✅ Favicon enviado:', faviconUrl);
      }

      // Preparar dados para envio
      const configToSave = {
        system_name: formData.system_name,
        logo_url: logoUrl,
        favicon_url: faviconUrl,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color
      };
      
      console.log('🚀 Salvando configurações:', configToSave);

      // Salvar configurações
      const success = await updateConfig(configToSave);

      if (success) {
        toast({
          title: "Configurações salvas!",
          description: "As configurações do sistema foram atualizadas com sucesso.",
        });
        
        // Limpar arquivos selecionados
        setLogoFile(null);
        setFaviconFile(null);
        
        // Atualizar favicon na página
        if (faviconUrl) {
          const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
          if (favicon) {
            favicon.href = faviconUrl;
          }
        }
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao salvar",
          description: "Não foi possível salvar as configurações.",
        });
      }
    } catch (error) {
      console.error('❌ Erro no handleSave:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (file: File | null, type: 'logo' | 'favicon') => {
    if (type === 'logo') {
      setLogoFile(file);
    } else {
      setFaviconFile(file);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando configurações...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Configurações do Sistema</h1>
          <p className="text-muted-foreground">Personalize a aparência e identidade do seu sistema</p>
        </div>

        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="geral" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="visual" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Visual</span>
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Arquivos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="system_name">Nome do Sistema</Label>
                  <Input
                    id="system_name"
                    value={formData.system_name}
                    onChange={(e) => setFormData({ ...formData, system_name: e.target.value })}
                    placeholder="Digite o nome do sistema"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nome atual: {config.system_name}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cores do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Cor Primária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Cor Secundária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                        placeholder="#64748b"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Preview das cores:</p>
                  <div className="flex gap-2">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: formData.primary_color }}
                    />
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: formData.secondary_color }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Logo do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.logo_url && (
                  <div className="space-y-2">
                    <Label>Logo Atual</Label>
                    <div className="p-4 border rounded-lg">
                      <img 
                        src={config.logo_url} 
                        alt="Logo atual" 
                        className="max-h-20 object-contain"
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="logo_upload">Nova Logo</Label>
                  <Input
                    id="logo_upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'logo')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: PNG, JPG, SVG. Tamanho recomendado: 200x60px
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Favicon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.favicon_url && (
                  <div className="space-y-2">
                    <Label>Favicon Atual</Label>
                    <div className="p-4 border rounded-lg">
                      <img 
                        src={config.favicon_url} 
                        alt="Favicon atual" 
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="favicon_upload">Novo Favicon</Label>
                  <Input
                    id="favicon_upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'favicon')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: PNG, ICO, SVG. Tamanho recomendado: 32x32px
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="min-w-32">
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>

        {/* Debug Info */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div><strong>Ready:</strong> {ready ? 'Sim' : 'Não'}</div>
            <div><strong>Loading:</strong> {loading ? 'Sim' : 'Não'}</div>
            <div><strong>Config ID:</strong> {config.id}</div>
            <div><strong>System Name:</strong> {config.system_name}</div>
            <div><strong>Form Name:</strong> {formData.system_name}</div>
            <div><strong>Names Match:</strong> {config.system_name === formData.system_name ? 'Sim' : 'Não'}</div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ConfiguracoesNew;
