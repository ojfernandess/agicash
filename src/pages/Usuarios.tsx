import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Profile {
  id: string;
  nome: string | null;
  email: string | null;
  role: 'admin' | 'financeiro' | 'usuario' | null;
  created_at: string;
  telefone?: string | null;
  documento?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  pix_key?: string | null;
  pix_tipo?: string | null;
  observacoes?: string | null;
}

const Usuarios = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filter, setFilter] = useState<'todos' | 'admin' | 'financeiro' | 'usuario'>('todos');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, email, role, created_at, telefone, documento, endereco, cidade, estado, cep, pix_key, pix_tipo, observacoes')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProfiles(data || []);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao carregar usuários', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id: string, role: 'admin' | 'financeiro' | 'usuario') => {
    try {
      setSavingId(id);
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Papel atualizado', description: 'O papel do usuário foi alterado com sucesso.' });
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, role } : p));
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar papel', description: err.message });
    } finally {
      setSavingId(null);
    }
  };

  const filtered = profiles.filter(p => filter === 'todos' ? true : (p.role || 'usuario') === filter);

  const updateField = async (id: string, patch: Partial<Profile>) => {
    try {
      setSavingId(id);
      const { error } = await supabase.from('profiles').update(patch).eq('id', id);
      if (error) throw error;
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
      toast({ title: 'Atualizado', description: 'Informações salvas com sucesso.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: err.message });
    } finally {
      setSavingId(null);
    }
  };

  const openEdit = (p: Profile) => {
    setEditing({ ...p });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      setSavingId(editing.id);
      const patch: Partial<Profile> = {
        nome: editing.nome,
        email: editing.email,
        telefone: editing.telefone || null,
        documento: editing.documento || null,
        endereco: editing.endereco || null,
        cidade: editing.cidade || null,
        estado: editing.estado || null,
        cep: editing.cep || null,
        pix_tipo: editing.pix_tipo || null,
        pix_key: editing.pix_key || null,
        observacoes: editing.observacoes || null,
      };
      const { error } = await supabase.from('profiles').update(patch).eq('id', editing.id);
      if (error) throw error;
      setProfiles(prev => prev.map(p => p.id === editing.id ? { ...p, ...patch } as Profile : p));
      toast({ title: 'Informações salvas', description: 'Perfil atualizado com sucesso.' });
      setEditOpen(false);
      setEditing(null);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: err.message });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Usuários</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtrar:</span>
            <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="usuario">Usuários</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadProfiles} disabled={loading}>
              Recarregar
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Papéis</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Papel</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.nome || '-'}</TableCell>
                        <TableCell>{p.email || '-'}</TableCell>
                        <TableCell className="capitalize">{p.role || 'usuario'}</TableCell>
                        <TableCell>{new Date(p.created_at).toLocaleString('pt-BR')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select defaultValue={p.role || 'usuario'} onValueChange={(val: any) => updateRole(p.id, val)}>
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Administrador</SelectItem>
                                <SelectItem value="financeiro">Financeiro</SelectItem>
                                <SelectItem value="usuario">Usuário</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                              Editar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={editing.nome || ''} onChange={(e)=> setEditing({ ...editing, nome: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={editing.email || ''} onChange={(e)=> setEditing({ ...editing, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={editing.telefone || ''} onChange={(e)=> setEditing({ ...editing, telefone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Documento</Label>
                  <Input value={editing.documento || ''} onChange={(e)=> setEditing({ ...editing, documento: e.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Endereço</Label>
                  <Input value={editing.endereco || ''} onChange={(e)=> setEditing({ ...editing, endereco: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input value={editing.cidade || ''} onChange={(e)=> setEditing({ ...editing, cidade: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input value={editing.estado || ''} onChange={(e)=> setEditing({ ...editing, estado: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input value={editing.cep || ''} onChange={(e)=> setEditing({ ...editing, cep: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Tipo Pix</Label>
                  <Select value={editing.pix_tipo || 'none'} onValueChange={(v:any)=> setEditing({ ...editing, pix_tipo: v === 'none' ? null : v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">(nenhum)</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="cpf">CPF</SelectItem>
                      <SelectItem value="cnpj">CNPJ</SelectItem>
                      <SelectItem value="telefone">Telefone</SelectItem>
                      <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Chave Pix</Label>
                  <Input value={editing.pix_key || ''} onChange={(e)=> setEditing({ ...editing, pix_key: e.target.value })} placeholder="Opcional" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Observações</Label>
                  <Input value={editing.observacoes || ''} onChange={(e)=> setEditing({ ...editing, observacoes: e.target.value })} />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={()=> setEditOpen(false)}>Cancelar</Button>
                  <Button onClick={saveEdit} disabled={savingId === editing.id}>{savingId === editing.id ? 'Salvando...' : 'Salvar'}</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Usuarios;


