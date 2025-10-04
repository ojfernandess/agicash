# Sistema de Customização - Flow Lend

## Funcionalidades Implementadas

### ✅ Sistema de Configurações
- **Nome do Sistema**: Personalize o nome que aparece no cabeçalho
- **Logo**: Upload de logo personalizada (PNG, JPG, SVG)
- **Favicon**: Upload de favicon personalizado (PNG, ICO, SVG)
- **Cores**: Personalização das cores primária e secundária do sistema

### ✅ Interface de Administração
- Página dedicada em `/configuracoes`
- Interface organizada em abas (Geral, Visual, Arquivos)
- Preview das cores em tempo real
- Upload de arquivos com validação

### ✅ Integração Completa
- Layout atualizado para usar configurações customizadas
- Favicon dinâmico na página
- Cores aplicadas em tempo real
- Sistema responsivo para mobile e desktop

## Como Configurar

### 1. Executar Migrações no Supabase

Execute os seguintes scripts SQL no Supabase SQL Editor:

#### A. Configurações do Sistema
```sql
-- Execute o arquivo: supabase/migrations/20251001192000_add_system_config.sql
```

#### B. Storage para Arquivos
```sql
-- Execute o arquivo: setup_storage.sql
```

### 2. Acessar Configurações

1. Faça login no sistema
2. Navegue para **Configurações** no menu lateral
3. Personalize conforme necessário:

#### Aba Geral
- Altere o nome do sistema

#### Aba Visual
- Escolha cores primária e secundária
- Veja preview em tempo real

#### Aba Arquivos
- Faça upload da logo (recomendado: 200x60px)
- Faça upload do favicon (recomendado: 32x32px)

### 3. Salvar Configurações

Clique em **"Salvar Configurações"** para aplicar as mudanças.

## Estrutura Técnica

### Arquivos Criados/Modificados

#### Novos Arquivos
- `src/hooks/use-system-config.ts` - Hook para gerenciar configurações
- `src/pages/Configuracoes.tsx` - Interface de configurações
- `supabase/migrations/20251001192000_add_system_config.sql` - Migração da tabela
- `setup_storage.sql` - Configuração do storage

#### Arquivos Modificados
- `src/components/Layout.tsx` - Integração com configurações
- `src/App.tsx` - Nova rota de configurações
- `src/integrations/supabase/types.ts` - Tipos TypeScript

### Banco de Dados

#### Tabela: `system_config`
```sql
- id: UUID (PK)
- user_id: UUID (FK para auth.users)
- system_name: TEXT
- logo_url: TEXT
- favicon_url: TEXT
- primary_color: TEXT
- secondary_color: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### Função: `get_system_config()`
Retorna as configurações do usuário logado ou valores padrão.

#### Storage: `system-assets`
Bucket público para armazenar logos e favicons.

## Recursos Avançados

### Cores Dinâmicas
- As cores são aplicadas em tempo real
- Preview visual antes de salvar
- Suporte a códigos hexadecimais

### Upload de Arquivos
- Validação de tipos de arquivo
- Armazenamento seguro no Supabase Storage
- URLs públicas para acesso direto

### Responsividade
- Interface adaptada para mobile
- Upload de arquivos otimizado
- Preview responsivo

## Troubleshooting

### Problema: Configurações não salvam
**Solução**: Verifique se as migrações foram executadas corretamente no Supabase.

### Problema: Upload de arquivos falha
**Solução**: Verifique se o bucket `system-assets` foi criado e as políticas estão corretas.

### Problema: Logo não aparece
**Solução**: Verifique se a URL da logo está correta e o arquivo é acessível.

### Problema: Cores não aplicam
**Solução**: Verifique se os códigos de cor estão no formato hexadecimal (#RRGGBB).

## Próximos Passos

### Melhorias Futuras
- [ ] Temas predefinidos
- [ ] Upload de múltiplos arquivos
- [ ] Backup/restore de configurações
- [ ] Configurações por empresa/organização
- [ ] API para configurações externas

### Integrações
- [ ] Integração com CDN para melhor performance
- [ ] Compressão automática de imagens
- [ ] Validação avançada de arquivos
- [ ] Histórico de configurações

