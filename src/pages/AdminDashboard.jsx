import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Users, Building2, FileText, PenLine, Mail, 
  AlertCircle, CheckCircle, XCircle, Shield,
  Plus, Edit, Trash2, UserPlus, Link2
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [tenantUsers, setTenantUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [userDialog, setUserDialog] = useState({ open: false, mode: 'create', data: {} });
  const [tenantDialog, setTenantDialog] = useState({ open: false, mode: 'create', data: {} });
  const [assignDialog, setAssignDialog] = useState({ open: false, data: {} });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [statsRes, tenantsRes, usersRes, tenantUsersRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/tenants', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/tenant-users', { headers })
      ]);

      const responses = [statsRes, tenantsRes, usersRes, tenantUsersRes];
      const has403 = responses.some(res => res.status === 403);
      
      if (has403) {
        setError('Acesso negado. Você não tem permissão para acessar o painel administrativo.');
        return;
      }

      if (!statsRes.ok || !tenantsRes.ok || !usersRes.ok) {
        throw new Error('Erro ao carregar dados');
      }

      const [statsData, tenantsData, usersData, tenantUsersData] = await Promise.all([
        statsRes.json(),
        tenantsRes.json(),
        usersRes.json(),
        tenantUsersRes.ok ? tenantUsersRes.json() : []
      ]);

      setStats(statsData);
      setTenants(tenantsData);
      setUsers(usersData);
      setTenantUsers(tenantUsersData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
          full_name: formData.get('full_name'),
          is_super_admin: formData.get('is_super_admin') === 'true'
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao criar usuário');
      }

      alert('Usuário criado com sucesso!');
      setUserDialog({ open: false, mode: 'create', data: {} });
      await loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const token = localStorage.getItem('token');
      const body = {
        email: formData.get('email'),
        full_name: formData.get('full_name'),
        is_active: formData.get('is_active') === 'true',
        email_verified: formData.get('email_verified') === 'true'
      };
      
      const password = formData.get('password');
      if (password) body.password = password;

      const res = await fetch(`/api/admin/users/${userDialog.data.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar usuário');
      }

      alert('Usuário atualizado com sucesso!');
      setUserDialog({ open: false, mode: 'create', data: {} });
      await loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao excluir usuário');
      }

      alert('Usuário excluído com sucesso!');
      await loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.get('name'),
          slug: formData.get('slug'),
          plan: formData.get('plan'),
          max_petitions: parseInt(formData.get('max_petitions')),
          max_signatures: parseInt(formData.get('max_signatures')),
          max_campaigns: parseInt(formData.get('max_campaigns'))
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao criar tenant');
      }

      alert('Tenant criado com sucesso!');
      setTenantDialog({ open: false, mode: 'create', data: {} });
      await loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateTenant = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/tenants/${tenantDialog.data.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.get('name'),
          slug: formData.get('slug'),
          plan: formData.get('plan'),
          max_petitions: parseInt(formData.get('max_petitions')),
          max_signatures: parseInt(formData.get('max_signatures')),
          max_campaigns: parseInt(formData.get('max_campaigns'))
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar tenant');
      }

      alert('Tenant atualizado com sucesso!');
      setTenantDialog({ open: false, mode: 'create', data: {} });
      await loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTenantStatusChange = async (tenantId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/tenants/${tenantId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Erro ao atualizar status');

      await loadAdminData();
    } catch (err) {
      alert('Erro ao atualizar status do tenant');
    }
  };

  const handleDeleteTenant = async (tenantId, tenantName) => {
    if (!confirm(`Tem certeza que deseja deletar o tenant "${tenantName}"? Esta ação é irreversível!`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/tenants/${tenantId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Erro ao deletar tenant');

      alert('Tenant deletado com sucesso!');
      await loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssignUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/tenant-users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tenant_id: formData.get('tenant_id'),
          user_id: formData.get('user_id'),
          role: formData.get('role')
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atribuir usuário');
      }

      alert('Usuário atribuído com sucesso!');
      setAssignDialog({ open: false, data: {} });
      await loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (!confirm('Tem certeza que deseja remover esta atribuição?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/tenant-users/${assignmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Erro ao remover atribuição');

      alert('Atribuição removida com sucesso!');
      await loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-500"><AlertCircle className="w-3 h-3 mr-1" />Suspenso</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{error}</p>
            <Button onClick={() => navigate('/')}>Voltar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
              Voltar ao Dashboard
            </Button>
          </div>
          <p className="text-gray-600 mt-2">Gestão completa do sistema - Acesso exclusivo Super Admin</p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
            <TabsTrigger value="users">👥 Usuários</TabsTrigger>
            <TabsTrigger value="tenants">🏢 Tenants</TabsTrigger>
            <TabsTrigger value="assignments">🔗 Atribuições</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tenants</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totals.tenants || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totals.users || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Petições</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totals.petitions || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assinaturas</CardTitle>
                  <PenLine className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totals.signatures || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Campanhas</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totals.campaigns || 0}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Resumo do Sistema</CardTitle>
                <CardDescription>Visão geral das principais métricas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Sistema de gestão multi-tenant ativo e operacional.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestão de Usuários</CardTitle>
                    <CardDescription>Criar, editar e gerenciar usuários do sistema</CardDescription>
                  </div>
                  <Button onClick={() => setUserDialog({ open: true, mode: 'create', data: {} })}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Usuário
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.full_name}</h3>
                          {user.is_super_admin && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              <Shield className="w-3 h-3 mr-1" />
                              Super Admin
                            </Badge>
                          )}
                          {user.email_verified ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Verificado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Não Verificado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {user.tenant_count} {user.tenant_count === 1 ? 'tenant' : 'tenants'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUserDialog({ open: true, mode: 'edit', data: user })}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.full_name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tenants">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestão de Tenants</CardTitle>
                    <CardDescription>Criar, editar e gerenciar organizações</CardDescription>
                  </div>
                  <Button onClick={() => setTenantDialog({ open: true, mode: 'create', data: {} })}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Tenant
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tenants.map((tenant) => (
                    <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{tenant.name}</h3>
                        <p className="text-sm text-gray-500">
                          {tenant.slug} • {tenant.plan} • {tenant.user_count} usuários • {tenant.petition_count} petições
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Criado em {new Date(tenant.created_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(tenant.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTenantDialog({ open: true, mode: 'edit', data: tenant })}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {tenant.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTenantStatusChange(tenant.id, 'suspended')}
                          >
                            Suspender
                          </Button>
                        )}
                        {tenant.status === 'suspended' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTenantStatusChange(tenant.id, 'active')}
                          >
                            Ativar
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Atribuições de Usuários</CardTitle>
                    <CardDescription>Vincular usuários aos tenants</CardDescription>
                  </div>
                  <Button onClick={() => setAssignDialog({ open: true, data: {} })}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Nova Atribuição
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tenantUsers.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{assignment.full_name}</h3>
                          <Badge variant="outline">{assignment.role}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">{assignment.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          <Link2 className="w-3 h-3 inline mr-1" />
                          {assignment.tenant_name} ({assignment.tenant_slug})
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {assignment.is_active ? (
                          <Badge className="bg-green-500">Ativo</Badge>
                        ) : (
                          <Badge className="bg-gray-500">Inativo</Badge>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveAssignment(assignment.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={userDialog.open} onOpenChange={(open) => setUserDialog({ ...userDialog, open })}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={userDialog.mode === 'create' ? handleCreateUser : handleUpdateUser}>
            <DialogHeader>
              <DialogTitle>{userDialog.mode === 'create' ? 'Criar Novo Usuário' : 'Editar Usuário'}</DialogTitle>
              <DialogDescription>
                {userDialog.mode === 'create' 
                  ? 'Preencha os dados do novo usuário.' 
                  : 'Atualize os dados do usuário.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  defaultValue={userDialog.data.email}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input 
                  id="full_name" 
                  name="full_name" 
                  defaultValue={userDialog.data.full_name}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha {userDialog.mode === 'edit' && '(deixe em branco para não alterar)'}</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required={userDialog.mode === 'create'}
                />
              </div>
              {userDialog.mode === 'create' && (
                <div className="grid gap-2">
                  <Label htmlFor="is_super_admin">Tipo de Usuário</Label>
                  <Select name="is_super_admin" defaultValue="false">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Usuário Normal</SelectItem>
                      <SelectItem value="true">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {userDialog.mode === 'edit' && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="is_active">Status</Label>
                    <Select name="is_active" defaultValue={userDialog.data.is_active?.toString()}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Ativo</SelectItem>
                        <SelectItem value="false">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email_verified">Email Verificado</Label>
                    <Select name="email_verified" defaultValue={userDialog.data.email_verified?.toString()}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Sim</SelectItem>
                        <SelectItem value="false">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUserDialog({ open: false, mode: 'create', data: {} })}>
                Cancelar
              </Button>
              <Button type="submit">
                {userDialog.mode === 'create' ? 'Criar' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={tenantDialog.open} onOpenChange={(open) => setTenantDialog({ ...tenantDialog, open })}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={tenantDialog.mode === 'create' ? handleCreateTenant : handleUpdateTenant}>
            <DialogHeader>
              <DialogTitle>{tenantDialog.mode === 'create' ? 'Criar Novo Tenant' : 'Editar Tenant'}</DialogTitle>
              <DialogDescription>
                {tenantDialog.mode === 'create' 
                  ? 'Configure o novo tenant (organização).' 
                  : 'Atualize as configurações do tenant.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Organização</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={tenantDialog.data.name}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug (URL única)</Label>
                <Input 
                  id="slug" 
                  name="slug" 
                  defaultValue={tenantDialog.data.slug}
                  required 
                  pattern="[a-z0-9-]+"
                  title="Apenas letras minúsculas, números e hífens"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plan">Plano</Label>
                <Select name="plan" defaultValue={tenantDialog.data.plan || 'free'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="max_petitions">Máx. Petições</Label>
                  <Input 
                    id="max_petitions" 
                    name="max_petitions" 
                    type="number" 
                    defaultValue={tenantDialog.data.max_petitions || 10}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max_signatures">Máx. Assinaturas</Label>
                  <Input 
                    id="max_signatures" 
                    name="max_signatures" 
                    type="number" 
                    defaultValue={tenantDialog.data.max_signatures || 1000}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max_campaigns">Máx. Campanhas</Label>
                  <Input 
                    id="max_campaigns" 
                    name="max_campaigns" 
                    type="number" 
                    defaultValue={tenantDialog.data.max_campaigns || 5}
                    required 
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTenantDialog({ open: false, mode: 'create', data: {} })}>
                Cancelar
              </Button>
              <Button type="submit">
                {tenantDialog.mode === 'create' ? 'Criar' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={assignDialog.open} onOpenChange={(open) => setAssignDialog({ ...assignDialog, open })}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleAssignUser}>
            <DialogHeader>
              <DialogTitle>Atribuir Usuário ao Tenant</DialogTitle>
              <DialogDescription>
                Vincule um usuário a uma organização com uma role específica.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="tenant_id">Tenant</Label>
                <Select name="tenant_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name} ({tenant.slug})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user_id">Usuário</Label>
                <Select name="user_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="member">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner (Proprietário)</SelectItem>
                    <SelectItem value="admin">Admin (Administrador)</SelectItem>
                    <SelectItem value="member">Member (Membro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAssignDialog({ open: false, data: {} })}>
                Cancelar
              </Button>
              <Button type="submit">Atribuir</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
