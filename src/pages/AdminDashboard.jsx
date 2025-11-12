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
import { toast } from 'sonner';
import { 
  Users, Building2, FileText, PenLine, Mail, 
  AlertCircle, CheckCircle, XCircle, Shield,
  Plus, Edit, Trash2, UserPlus, Link2, Loader2
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [tenantUsers, setTenantUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [userDialog, setUserDialog] = useState({ open: false, mode: 'create', data: {} });
  const [tenantDialog, setTenantDialog] = useState({ open: false, mode: 'create', data: {} });
  const [assignDialog, setAssignDialog] = useState({ open: false, data: {} });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
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
      if (!silent) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      setActionLoading(true);
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

      toast.success('Usuário criado com sucesso!');
      setUserDialog({ open: false, mode: 'create', data: {} });
      await loadAdminData(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      setActionLoading(true);
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

      toast.success('Usuário atualizado com sucesso!');
      setUserDialog({ open: false, mode: 'create', data: {} });
      await loadAdminData(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
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

      toast.success('Usuário excluído com sucesso!');
      await loadAdminData(true);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      setActionLoading(true);
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

      toast.success('Tenant criado com sucesso!');
      setTenantDialog({ open: false, mode: 'create', data: {} });
      await loadAdminData(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTenant = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      setActionLoading(true);
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

      toast.success('Tenant atualizado com sucesso!');
      setTenantDialog({ open: false, mode: 'create', data: {} });
      await loadAdminData(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
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

      toast.success('Status atualizado com sucesso!');
      await loadAdminData(true);
    } catch (err) {
      toast.error('Erro ao atualizar status do tenant');
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

      toast.success('Tenant deletado com sucesso!');
      await loadAdminData(true);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAssignUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      setActionLoading(true);
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

      toast.success('Usuário atribuído com sucesso!');
      setAssignDialog({ open: false, data: {} });
      await loadAdminData(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
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

      toast.success('Atribuição removida com sucesso!');
      await loadAdminData(true);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><AlertCircle className="w-3 h-3 mr-1" />Suspenso</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="w-3 h-3 mr-1" />Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <Shield className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-600 font-medium">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        <Card className="max-w-md shadow-xl border-red-200">
          <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Erro de Acesso
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 mb-4">{error}</p>
            <Button onClick={() => navigate('/')} className="w-full">
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-gray-600 mt-1">Gestão completa do sistema - Acesso exclusivo Super Admin</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/')} className="shadow-sm">
              Voltar ao Dashboard
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white shadow-md h-12">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              📊 Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              👥 Usuários
            </TabsTrigger>
            <TabsTrigger value="tenants" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              🏢 Tenants
            </TabsTrigger>
            <TabsTrigger value="assignments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              🔗 Atribuições
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Tenants</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats?.totals.tenants || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">Organizações ativas</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Usuários</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats?.totals.users || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">Usuários cadastrados</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Petições</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats?.totals.petitions || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">Petições criadas</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Assinaturas</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <PenLine className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats?.totals.signatures || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">Total de apoiadores</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Campanhas</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats?.totals.campaigns || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">Campanhas enviadas</p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Status do Sistema
                </CardTitle>
                <CardDescription>Visão geral das principais métricas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="font-medium text-gray-900">Sistema Operacional</span>
                    </div>
                    <Badge className="bg-green-500">Online</Badge>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Todos os serviços estão funcionando normalmente. Multi-tenancy ativo com isolamento completo de dados.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Gestão de Usuários</CardTitle>
                    <CardDescription className="mt-2">Criar, editar e gerenciar usuários do sistema</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setUserDialog({ open: true, mode: 'create', data: {} })}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Usuário
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="group flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all bg-white">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{user.full_name}</h3>
                          {user.is_super_admin && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                              <Shield className="w-3 h-3 mr-1" />
                              Super Admin
                            </Badge>
                          )}
                          {user.email_verified ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verificado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Não Verificado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {user.tenant_count} {user.tenant_count === 1 ? 'tenant' : 'tenants'} • 
                          Criado em {new Date(user.created_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUserDialog({ open: true, mode: 'edit', data: user })}
                          className="hover:bg-indigo-50 hover:border-indigo-300"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.full_name)}
                          className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tenants">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Gestão de Tenants</CardTitle>
                    <CardDescription className="mt-2">Criar, editar e gerenciar organizações</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setTenantDialog({ open: true, mode: 'create', data: {} })}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Tenant
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tenants.map((tenant) => (
                    <div key={tenant.id} className="group flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all bg-white">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{tenant.name}</h3>
                          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                            {tenant.plan}
                          </Badge>
                          {getStatusBadge(tenant.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          /{tenant.slug} • {tenant.user_count} usuários • {tenant.petition_count} petições
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Limites: {tenant.max_petitions} petições, {tenant.max_signatures} assinaturas, {tenant.max_campaigns} campanhas
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTenantDialog({ open: true, mode: 'edit', data: tenant })}
                          className="hover:bg-indigo-50 hover:border-indigo-300"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        {tenant.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTenantStatusChange(tenant.id, 'suspended')}
                            className="hover:bg-yellow-50 hover:border-yellow-300"
                          >
                            Suspender
                          </Button>
                        )}
                        {tenant.status === 'suspended' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTenantStatusChange(tenant.id, 'active')}
                            className="hover:bg-green-50 hover:border-green-300"
                          >
                            Ativar
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                          className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Deletar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Atribuições de Usuários</CardTitle>
                    <CardDescription className="mt-2">Vincular usuários aos tenants com roles específicas</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setAssignDialog({ open: true, data: {} })}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Nova Atribuição
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tenantUsers.map((assignment) => (
                    <div key={assignment.id} className="group flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all bg-white">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{assignment.full_name}</h3>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {assignment.role}
                          </Badge>
                          {assignment.is_active ? (
                            <Badge className="bg-green-500">Ativo</Badge>
                          ) : (
                            <Badge className="bg-gray-500">Inativo</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{assignment.email}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Link2 className="w-3 h-3" />
                          {assignment.tenant_name} ({assignment.tenant_slug})
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveAssignment(assignment.id)}
                          className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remover
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
        <DialogContent className="sm:max-w-[500px] bg-white">
          <form onSubmit={userDialog.mode === 'create' ? handleCreateUser : handleUpdateUser}>
            <DialogHeader className="border-b pb-4 mb-4">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {userDialog.mode === 'create' ? '✨ Criar Novo Usuário' : '✏️ Editar Usuário'}
              </DialogTitle>
              <DialogDescription>
                {userDialog.mode === 'create' 
                  ? 'Preencha os dados do novo usuário do sistema.' 
                  : 'Atualize as informações do usuário.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="usuario@exemplo.com"
                  defaultValue={userDialog.data.email}
                  className="h-11"
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="full_name" className="text-sm font-medium">Nome Completo *</Label>
                <Input 
                  id="full_name" 
                  name="full_name" 
                  placeholder="Nome completo do usuário"
                  defaultValue={userDialog.data.full_name}
                  className="h-11"
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha {userDialog.mode === 'edit' && <span className="text-gray-400 font-normal">(deixe em branco para não alterar)</span>}
                </Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="••••••••"
                  className="h-11"
                  required={userDialog.mode === 'create'}
                />
              </div>
              {userDialog.mode === 'create' && (
                <div className="grid gap-2">
                  <Label htmlFor="is_super_admin" className="text-sm font-medium">Tipo de Usuário</Label>
                  <Select name="is_super_admin" defaultValue="false">
                    <SelectTrigger className="h-11">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="is_active" className="text-sm font-medium">Status</Label>
                    <Select name="is_active" defaultValue={userDialog.data.is_active?.toString()}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Ativo</SelectItem>
                        <SelectItem value="false">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email_verified" className="text-sm font-medium">Email Verificado</Label>
                    <Select name="email_verified" defaultValue={userDialog.data.email_verified?.toString()}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Sim</SelectItem>
                        <SelectItem value="false">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="border-t pt-4 mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setUserDialog({ open: false, mode: 'create', data: {} })}
                disabled={actionLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  userDialog.mode === 'create' ? 'Criar Usuário' : 'Salvar Alterações'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={tenantDialog.open} onOpenChange={(open) => setTenantDialog({ ...tenantDialog, open })}>
        <DialogContent className="sm:max-w-[650px] bg-white">
          <form onSubmit={tenantDialog.mode === 'create' ? handleCreateTenant : handleUpdateTenant}>
            <DialogHeader className="border-b pb-4 mb-4">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {tenantDialog.mode === 'create' ? '🏢 Criar Novo Tenant' : '✏️ Editar Tenant'}
              </DialogTitle>
              <DialogDescription>
                {tenantDialog.mode === 'create' 
                  ? 'Configure a nova organização com suas permissões e limites.' 
                  : 'Atualize as configurações e limites da organização.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-sm font-medium">Nome da Organização *</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Minha Organização"
                    defaultValue={tenantDialog.data.name}
                    className="h-11"
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug" className="text-sm font-medium">Slug (URL única) *</Label>
                  <Input 
                    id="slug" 
                    name="slug" 
                    placeholder="minha-organizacao"
                    defaultValue={tenantDialog.data.slug}
                    className="h-11"
                    required 
                    pattern="[a-z0-9-]+"
                    title="Apenas letras minúsculas, números e hífens"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plan" className="text-sm font-medium">Plano</Label>
                <Select name="plan" defaultValue={tenantDialog.data.plan || 'free'}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">🆓 Free</SelectItem>
                    <SelectItem value="pro">⭐ Pro</SelectItem>
                    <SelectItem value="enterprise">🚀 Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 text-gray-700">Limites do Plano</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="max_petitions" className="text-sm font-medium">Máx. Petições</Label>
                    <Input 
                      id="max_petitions" 
                      name="max_petitions" 
                      type="number" 
                      defaultValue={tenantDialog.data.max_petitions || 10}
                      className="h-11"
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="max_signatures" className="text-sm font-medium">Máx. Assinaturas</Label>
                    <Input 
                      id="max_signatures" 
                      name="max_signatures" 
                      type="number" 
                      defaultValue={tenantDialog.data.max_signatures || 1000}
                      className="h-11"
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="max_campaigns" className="text-sm font-medium">Máx. Campanhas</Label>
                    <Input 
                      id="max_campaigns" 
                      name="max_campaigns" 
                      type="number" 
                      defaultValue={tenantDialog.data.max_campaigns || 5}
                      className="h-11"
                      required 
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="border-t pt-4 mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setTenantDialog({ open: false, mode: 'create', data: {} })}
                disabled={actionLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  tenantDialog.mode === 'create' ? 'Criar Tenant' : 'Salvar Alterações'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={assignDialog.open} onOpenChange={(open) => setAssignDialog({ ...assignDialog, open })}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <form onSubmit={handleAssignUser}>
            <DialogHeader className="border-b pb-4 mb-4">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                🔗 Atribuir Usuário ao Tenant
              </DialogTitle>
              <DialogDescription>
                Vincule um usuário a uma organização com uma role específica.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label htmlFor="tenant_id" className="text-sm font-medium">Tenant *</Label>
                <Select name="tenant_id" required>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione a organização" />
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
                <Label htmlFor="user_id" className="text-sm font-medium">Usuário *</Label>
                <Select name="user_id" required>
                  <SelectTrigger className="h-11">
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
                <Label htmlFor="role" className="text-sm font-medium">Role (Permissão)</Label>
                <Select name="role" defaultValue="member">
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">👑 Owner (Proprietário)</SelectItem>
                    <SelectItem value="admin">⚡ Admin (Administrador)</SelectItem>
                    <SelectItem value="member">👤 Member (Membro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="border-t pt-4 mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setAssignDialog({ open: false, data: {} })}
                disabled={actionLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Atribuindo...
                  </>
                ) : (
                  'Atribuir Usuário'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
