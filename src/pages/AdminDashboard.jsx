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
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from 'sonner';
import { 
  Users, Building2, FileText, PenLine, Mail, 
  AlertCircle, CheckCircle, XCircle, Shield,
  Plus, Edit, Trash2, UserPlus, Link2, Loader2,
  TrendingUp, Activity, LayoutDashboard, Crown, Settings
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
  
  // Confirmation dialogs state
  const [deleteUserDialog, setDeleteUserDialog] = useState({ open: false, target: null, loading: false });
  const [deleteTenantDialog, setDeleteTenantDialog] = useState({ open: false, target: null, loading: false });
  const [removeAssignmentDialog, setRemoveAssignmentDialog] = useState({ open: false, target: null, loading: false });

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

  const handleDeleteUser = (userId, userName) => {
    setDeleteUserDialog({ open: true, target: { id: userId, name: userName } });
  };

  const confirmDeleteUser = async () => {
    try {
      setDeleteUserDialog(prev => ({ ...prev, loading: true }));
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${deleteUserDialog.target.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao excluir usuário');
      }

      toast.success('Usuário excluído com sucesso!');
      setDeleteUserDialog({ open: false, target: null, loading: false });
      await loadAdminData(true);
    } catch (err) {
      toast.error(err.message);
      setDeleteUserDialog(prev => ({ ...prev, loading: false }));
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
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 shadow-sm"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>;
      case 'suspended':
        return <Badge className="bg-amber-500 hover:bg-amber-600 shadow-sm"><AlertCircle className="w-3 h-3 mr-1" />Suspenso</Badge>;
      case 'cancelled':
        return <Badge className="bg-rose-500 hover:bg-rose-600 shadow-sm"><XCircle className="w-3 h-3 mr-1" />Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6 shadow-lg"></div>
            <Shield className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">Carregando painel administrativo...</p>
          <p className="text-gray-500 text-sm mt-2">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
        <Card className="max-w-md shadow-2xl border-rose-200 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <XCircle className="w-6 h-6" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 mb-6 text-lg">{error}</p>
            <Button onClick={() => navigate('/')} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-500">
        {/* Header with gradient background */}
        <div className="mb-8 p-8 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl ring-4 ring-white/30">
                <Shield className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  Painel Administrativo
                  <Activity className="w-8 h-8 text-white/80 animate-pulse" />
                </h1>
                <p className="text-indigo-100 text-lg">Gestão completa do sistema - Acesso exclusivo Super Admin</p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/')} 
              className="shadow-lg hover:shadow-xl transition-all bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg rounded-xl p-1.5 h-14 border border-indigo-100">
            <TabsTrigger value="dashboard" className="rounded-lg font-semibold transition-all gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg font-semibold transition-all gap-2">
              <Users className="w-4 h-4" />
              <span>Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="tenants" className="rounded-lg font-semibold transition-all gap-2">
              <Building2 className="w-4 h-4" />
              <span>Tenants</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="rounded-lg font-semibold transition-all gap-2">
              <Link2 className="w-4 h-4" />
              <span>Atribuições</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 transition-opacity duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Stats Cards with improved design */}
              <Card className="group shadow-lg border-0 bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-600">Tenants</CardTitle>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {stats?.totals.tenants || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Organizações ativas
                  </p>
                </CardContent>
              </Card>

              <Card className="group shadow-lg border-0 bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-600">Usuários</CardTitle>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {stats?.totals.users || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Usuários cadastrados
                  </p>
                </CardContent>
              </Card>

              <Card className="group shadow-lg border-0 bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-600">Petições</CardTitle>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {stats?.totals.petitions || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Petições criadas
                  </p>
                </CardContent>
              </Card>

              <Card className="group shadow-lg border-0 bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-600">Assinaturas</CardTitle>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <PenLine className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    {stats?.totals.signatures || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Total de apoiadores
                  </p>
                </CardContent>
              </Card>

              <Card className="group shadow-lg border-0 bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-600">Campanhas</CardTitle>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                    {stats?.totals.campaigns || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Campanhas enviadas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* System Status Card */}
            <Card className="shadow-xl border-0 bg-white overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 pointer-events-none"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  Status do Sistema
                </CardTitle>
                <CardDescription className="text-base">Visão geral das principais métricas</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping pointer-events-none"></div>
                      </div>
                      <span className="font-semibold text-gray-900 text-lg">Sistema Operacional</span>
                    </div>
                    <Badge className="bg-emerald-500 text-white shadow-md px-4 py-1.5">Online</Badge>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
                    ✨ Todos os serviços estão funcionando normalmente. Multi-tenancy ativo com isolamento completo de dados.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="transition-opacity duration-300">
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-indigo-50/30 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Gestão de Usuários</CardTitle>
                    <CardDescription className="mt-2 text-base">Criar, editar e gerenciar usuários do sistema</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setUserDialog({ open: true, mode: 'create', data: {} })}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Usuário
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {users.map((user, index) => (
                    <div 
                      key={user.id} 
                      className="group flex items-center justify-between p-6 border-2 border-gray-100 rounded-2xl hover:border-indigo-200 hover:shadow-lg transition-all bg-gradient-to-r from-white to-gray-50 hover:from-indigo-50/50 hover:to-purple-50/50"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{user.full_name}</h3>
                          {user.is_super_admin && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-md">
                              <Shield className="w-3 h-3 mr-1" />
                              Super Admin
                            </Badge>
                          )}
                          {user.email_verified ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verificado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 shadow-sm">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Não Verificado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 font-medium">{user.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {user.tenant_count} {user.tenant_count === 1 ? 'tenant' : 'tenants'} • 
                          Criado em {new Date(user.created_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUserDialog({ open: true, mode: 'edit', data: user })}
                          className="hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.full_name)}
                          className="hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 transition-all"
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

          <TabsContent value="tenants" className="transition-opacity duration-300">
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-indigo-50/30 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Gestão de Tenants</CardTitle>
                    <CardDescription className="mt-2 text-base">Criar, editar e gerenciar organizações</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setTenantDialog({ open: true, mode: 'create', data: {} })}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Tenant
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {tenants.map((tenant, index) => (
                    <div 
                      key={tenant.id} 
                      className="group flex items-center justify-between p-6 border-2 border-gray-100 rounded-2xl hover:border-indigo-200 hover:shadow-lg transition-all bg-gradient-to-r from-white to-gray-50 hover:from-indigo-50/50 hover:to-purple-50/50"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{tenant.name}</h3>
                          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm">
                            {tenant.plan}
                          </Badge>
                          {getStatusBadge(tenant.status)}
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          /{tenant.slug} • {tenant.user_count} usuários • {tenant.petition_count} petições
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Limites: {tenant.max_petitions} petições, {tenant.max_signatures} assinaturas, {tenant.max_campaigns} campanhas
                        </p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTenantDialog({ open: true, mode: 'edit', data: tenant })}
                          className="hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        {tenant.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTenantStatusChange(tenant.id, 'suspended')}
                            className="hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-all"
                          >
                            Suspender
                          </Button>
                        )}
                        {tenant.status === 'suspended' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTenantStatusChange(tenant.id, 'active')}
                            className="hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all"
                          >
                            Ativar
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                          className="hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 transition-all"
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

          <TabsContent value="assignments" className="transition-opacity duration-300">
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-indigo-50/30 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Atribuições de Usuários</CardTitle>
                    <CardDescription className="mt-2 text-base">Vincular usuários aos tenants com roles específicas</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setAssignDialog({ open: true, data: {} })}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Nova Atribuição
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {tenantUsers.map((assignment, index) => (
                    <div 
                      key={assignment.id} 
                      className="group flex items-center justify-between p-6 border-2 border-gray-100 rounded-2xl hover:border-indigo-200 hover:shadow-lg transition-all bg-gradient-to-r from-white to-gray-50 hover:from-indigo-50/50 hover:to-purple-50/50"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{assignment.full_name}</h3>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 shadow-sm">
                            {assignment.role}
                          </Badge>
                          {assignment.is_active ? (
                            <Badge className="bg-emerald-500 shadow-sm">Ativo</Badge>
                          ) : (
                            <Badge className="bg-gray-500 shadow-sm">Inativo</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 font-medium">{assignment.email}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Link2 className="w-3 h-3" />
                          {assignment.tenant_name} ({assignment.tenant_slug})
                        </p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveAssignment(assignment.id)}
                          className="hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 transition-all"
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

      {/* User Dialog */}
      <Dialog open={userDialog.open} onOpenChange={(open) => setUserDialog({ ...userDialog, open })}>
        <DialogContent className="sm:max-w-[520px] bg-white shadow-2xl">
          <form onSubmit={userDialog.mode === 'create' ? handleCreateUser : handleUpdateUser}>
            <DialogHeader className="border-b pb-5 mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 -m-6 p-6 rounded-t-lg">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                {userDialog.mode === 'create' ? (
                  <>
                    <UserPlus className="w-6 h-6 text-indigo-600" />
                    Criar Novo Usuário
                  </>
                ) : (
                  <>
                    <Edit className="w-6 h-6 text-indigo-600" />
                    Editar Usuário
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                {userDialog.mode === 'create' 
                  ? 'Preencha os dados do novo usuário do sistema.' 
                  : 'Atualize as informações do usuário.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email *</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="usuario@exemplo.com"
                  defaultValue={userDialog.data.email}
                  className="h-11 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="full_name" className="text-sm font-semibold text-gray-700">Nome Completo *</Label>
                <Input 
                  id="full_name" 
                  name="full_name" 
                  placeholder="Nome completo do usuário"
                  defaultValue={userDialog.data.full_name}
                  className="h-11 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Senha {userDialog.mode === 'edit' && <span className="text-gray-400 font-normal text-xs">(deixe em branco para não alterar)</span>}
                </Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="••••••••"
                  className="h-11 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                  required={userDialog.mode === 'create'}
                />
              </div>
              {userDialog.mode === 'create' && (
                <div className="grid gap-2">
                  <Label htmlFor="is_super_admin" className="text-sm font-semibold text-gray-700">Tipo de Usuário</Label>
                  <Select name="is_super_admin" defaultValue="false">
                    <SelectTrigger className="h-11 border-gray-200">
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
                    <Label htmlFor="is_active" className="text-sm font-semibold text-gray-700">Status</Label>
                    <Select name="is_active" defaultValue={userDialog.data.is_active?.toString()}>
                      <SelectTrigger className="h-11 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Ativo</SelectItem>
                        <SelectItem value="false">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email_verified" className="text-sm font-semibold text-gray-700">Email Verificado</Label>
                    <Select name="email_verified" defaultValue={userDialog.data.email_verified?.toString()}>
                      <SelectTrigger className="h-11 border-gray-200">
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
            <DialogFooter className="border-t pt-5 mt-5 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setUserDialog({ open: false, mode: 'create', data: {} })}
                disabled={actionLoading}
                className="border-gray-200"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
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

      {/* Tenant Dialog */}
      <Dialog open={tenantDialog.open} onOpenChange={(open) => setTenantDialog({ ...tenantDialog, open })}>
        <DialogContent className="sm:max-w-[680px] bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={tenantDialog.mode === 'create' ? handleCreateTenant : handleUpdateTenant}>
            <DialogHeader className="border-b pb-5 mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 -m-6 p-6 rounded-t-lg sticky top-0 z-10">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                {tenantDialog.mode === 'create' ? (
                  <>
                    <Building2 className="w-6 h-6 text-indigo-600" />
                    Criar Novo Tenant
                  </>
                ) : (
                  <>
                    <Edit className="w-6 h-6 text-indigo-600" />
                    Editar Tenant
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                {tenantDialog.mode === 'create' 
                  ? 'Configure a nova organização com suas permissões e limites.' 
                  : 'Atualize as configurações e limites da organização.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4 px-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Nome da Organização *</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Minha Organização"
                    defaultValue={tenantDialog.data.name}
                    className="h-11 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug" className="text-sm font-semibold text-gray-700">Slug (URL única) *</Label>
                  <Input 
                    id="slug" 
                    name="slug" 
                    placeholder="minha-organizacao"
                    defaultValue={tenantDialog.data.slug}
                    className="h-11 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                    required 
                    pattern="[a-z0-9-]+"
                    title="Apenas letras minúsculas, números e hífens"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plan" className="text-sm font-semibold text-gray-700">Plano</Label>
                <Select name="plan" defaultValue={tenantDialog.data.plan || 'free'}>
                  <SelectTrigger className="h-11 border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">🆓 Free</SelectItem>
                    <SelectItem value="pro">⭐ Pro</SelectItem>
                    <SelectItem value="enterprise">🚀 Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="border-t pt-5 mt-2">
                <h4 className="font-semibold mb-4 text-gray-700 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Limites do Plano
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="max_petitions" className="text-sm font-semibold text-gray-700">Máx. Petições</Label>
                    <Input 
                      id="max_petitions" 
                      name="max_petitions" 
                      type="number" 
                      defaultValue={tenantDialog.data.max_petitions || 10}
                      className="h-11 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="max_signatures" className="text-sm font-semibold text-gray-700">Máx. Assinaturas</Label>
                    <Input 
                      id="max_signatures" 
                      name="max_signatures" 
                      type="number" 
                      defaultValue={tenantDialog.data.max_signatures || 1000}
                      className="h-11 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="max_campaigns" className="text-sm font-semibold text-gray-700">Máx. Campanhas</Label>
                    <Input 
                      id="max_campaigns" 
                      name="max_campaigns" 
                      type="number" 
                      defaultValue={tenantDialog.data.max_campaigns || 5}
                      className="h-11 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                      required 
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="border-t pt-5 mt-5 gap-2 sticky bottom-0 bg-white -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setTenantDialog({ open: false, mode: 'create', data: {} })}
                disabled={actionLoading}
                className="border-gray-200"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
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

      {/* Assignment Dialog */}
      <Dialog open={assignDialog.open} onOpenChange={(open) => setAssignDialog({ ...assignDialog, open })}>
        <DialogContent className="sm:max-w-[520px] bg-white shadow-2xl">
          <form onSubmit={handleAssignUser}>
            <DialogHeader className="border-b pb-5 mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 -m-6 p-6 rounded-t-lg">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-indigo-600" />
                Nova Atribuição
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                Vincule um usuário a um tenant com uma role específica.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label htmlFor="tenant_id" className="text-sm font-semibold text-gray-700">Tenant *</Label>
                <Select name="tenant_id" required>
                  <SelectTrigger className="h-11 border-gray-200">
                    <SelectValue placeholder="Selecione um tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name} (/{tenant.slug})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user_id" className="text-sm font-semibold text-gray-700">Usuário *</Label>
                <Select name="user_id" required>
                  <SelectTrigger className="h-11 border-gray-200">
                    <SelectValue placeholder="Selecione um usuário" />
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
                <Label htmlFor="role" className="text-sm font-semibold text-gray-700">Role *</Label>
                <Select name="role" defaultValue="member" required>
                  <SelectTrigger className="h-11 border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">👑 Owner</SelectItem>
                    <SelectItem value="admin">⚙️ Admin</SelectItem>
                    <SelectItem value="member">👤 Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="border-t pt-5 mt-5 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setAssignDialog({ open: false, data: {} })}
                disabled={actionLoading}
                className="border-gray-200"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Criar Atribuição'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
