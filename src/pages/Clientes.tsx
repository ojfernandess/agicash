import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Settings, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string | null;
  endereco: string | null;
  status: string;
  data_cadastro: string;
}

interface ConfiguracaoJuros {
  id?: string;
  cliente_id: string;
  taxa_juros_diaria_padrao: number;
  taxa_juros_diaria_atraso: number;
  ativo: boolean;
}

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [deletingCliente, setDeletingCliente] = useState<Cliente | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    email: "",
    endereco: "",
  });

  const [configData, setConfigData] = useState({
    taxa_juros_diaria_padrao: 0.033333, // 1% ao dia (30% ao mês)
    taxa_juros_diaria_atraso: 0.05, // 5% ao dia
  });

  const [editFormData, setEditFormData] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    email: "",
    endereco: "",
    status: "ativo",
  });

  useEffect(() => {
    loadClientes();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.cpf.includes(searchTerm) ||
        cliente.telefone.includes(searchTerm)
      );
      setFilteredClientes(filtered);
    } else {
      setFilteredClientes(clientes);
    }
  }, [searchTerm, clientes]);

  const loadClientes = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("data_cadastro", { ascending: false });

      if (error) throw error;
      setClientes(data || []);
      setFilteredClientes(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar clientes",
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

      const { error } = await supabase.from("clientes").insert({
        ...formData,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Cliente cadastrado!",
        description: "O cliente foi adicionado com sucesso.",
      });

      setDialogOpen(false);
      setFormData({
        nome: "",
        cpf: "",
        telefone: "",
        email: "",
        endereco: "",
      });
      loadClientes();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar cliente",
        description: error.message,
      });
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCliente) return;

    try {
      // Por enquanto, apenas mostrar uma mensagem até a migração ser executada
      toast({
        title: "Configuração temporária!",
        description: "Execute a migração no Supabase para salvar as configurações permanentemente.",
      });

      setConfigDialogOpen(false);
      setSelectedCliente(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar configuração",
        description: error.message,
      });
    }
  };

  const openConfigDialog = async (cliente: Cliente) => {
    setSelectedCliente(cliente);
    
    try {
      // Por enquanto, usar valores padrão até a migração ser executada
      setConfigData({
        taxa_juros_diaria_padrao: 0.033333,
        taxa_juros_diaria_atraso: 0.05,
      });

      setConfigDialogOpen(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar configuração",
        description: error.message,
      });
    }
  };

  const openEditDialog = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setEditFormData({
      nome: cliente.nome,
      cpf: cliente.cpf,
      telefone: cliente.telefone,
      email: cliente.email || "",
      endereco: cliente.endereco || "",
      status: cliente.status,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (cliente: Cliente) => {
    setDeletingCliente(cliente);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCliente) return;

    try {
      const { error } = await supabase
        .from("clientes")
        .update({
          nome: editFormData.nome,
          cpf: editFormData.cpf,
          telefone: editFormData.telefone,
          email: editFormData.email || null,
          endereco: editFormData.endereco || null,
          status: editFormData.status,
        })
        .eq("id", editingCliente.id);

      if (error) throw error;

      toast({
        title: "Cliente atualizado!",
        description: "Os dados do cliente foram atualizados com sucesso.",
      });

      setEditDialogOpen(false);
      setEditingCliente(null);
      loadClientes();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar cliente",
        description: error.message,
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingCliente) return;

    try {
      const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("id", deletingCliente.id);

      if (error) throw error;

      toast({
        title: "Cliente excluído!",
        description: "O cliente foi excluído com sucesso.",
      });

      setDeleteDialogOpen(false);
      setDeletingCliente(null);
      loadClientes();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir cliente",
        description: error.message,
      });
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Clientes</h1>
            <p className="text-muted-foreground">Gerencie seus clientes</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Novo Cliente</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Cadastrar Cliente
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, CPF ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : filteredClientes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado ainda"}
              </p>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClientes.map((cliente) => (
                        <TableRow key={cliente.id}>
                          <TableCell className="font-medium">{cliente.nome}</TableCell>
                          <TableCell>{cliente.cpf}</TableCell>
                          <TableCell>{cliente.telefone}</TableCell>
                          <TableCell>{cliente.email || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={cliente.status === "ativo" ? "default" : "secondary"}>
                              {cliente.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openConfigDialog(cliente)}
                              >
                                <Settings className="h-4 w-4 mr-1" />
                                Juros
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(cliente)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteDialog(cliente)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Excluir
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {filteredClientes.map((cliente) => (
                    <Card key={cliente.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{cliente.nome}</h3>
                          <Badge variant={cliente.status === "ativo" ? "default" : "secondary"}>
                            {cliente.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">CPF</p>
                            <p className="font-medium">{cliente.cpf}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Telefone</p>
                            <p className="font-medium">{cliente.telefone}</p>
                          </div>
                          {cliente.email && (
                            <div>
                              <p className="text-muted-foreground">Email</p>
                              <p className="font-medium">{cliente.email}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openConfigDialog(cliente)}
                            className="w-full"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Configurar Juros
                          </Button>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(cliente)}
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(cliente)}
                              className="flex-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Configuração de Juros */}
        <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>
                Configurar Juros - {selectedCliente?.nome}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleConfigSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="taxa_juros_diaria_padrao">
                  Taxa de Juros Diária Padrão (%)
                </Label>
                <Input
                  id="taxa_juros_diaria_padrao"
                  type="number"
                  step="0.000001"
                  min="0"
                  max="1"
                  value={configData.taxa_juros_diaria_padrao}
                  onChange={(e) => setConfigData({ 
                    ...configData, 
                    taxa_juros_diaria_padrao: parseFloat(e.target.value) || 0 
                  })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Padrão: 0.033333 (1% ao dia = 30% ao mês)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxa_juros_diaria_atraso">
                  Taxa de Juros Diária em Atraso (%)
                </Label>
                <Input
                  id="taxa_juros_diaria_atraso"
                  type="number"
                  step="0.000001"
                  min="0"
                  max="1"
                  value={configData.taxa_juros_diaria_atraso}
                  onChange={(e) => setConfigData({ 
                    ...configData, 
                    taxa_juros_diaria_atraso: parseFloat(e.target.value) || 0 
                  })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Padrão: 0.05 (5% ao dia)
                </p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">Exemplo de Cálculo:</p>
                <p className="text-xs text-muted-foreground">
                  Empréstimo de R$ 1.000,00 com 5 dias de atraso:
                </p>
                <p className="text-xs text-muted-foreground">
                  Juros: R$ {((1000 * configData.taxa_juros_diaria_atraso * 5).toFixed(2))}
                </p>
              </div>
              <Button type="submit" className="w-full">
                Salvar Configuração
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Edição de Cliente */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_nome">Nome Completo *</Label>
                <Input
                  id="edit_nome"
                  value={editFormData.nome}
                  onChange={(e) => setEditFormData({ ...editFormData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_cpf">CPF *</Label>
                <Input
                  id="edit_cpf"
                  value={editFormData.cpf}
                  onChange={(e) => setEditFormData({ ...editFormData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_telefone">Telefone *</Label>
                <Input
                  id="edit_telefone"
                  value={editFormData.telefone}
                  onChange={(e) => setEditFormData({ ...editFormData, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_endereco">Endereço</Label>
                <Input
                  id="edit_endereco"
                  value={editFormData.endereco}
                  onChange={(e) => setEditFormData({ ...editFormData, endereco: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_status">Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Atualizar Cliente
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o cliente <strong>{deletingCliente?.nome}</strong>?
                Esta ação não pode ser desfeita e também excluirá todos os empréstimos relacionados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Clientes;
