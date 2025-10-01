import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  CreditCard, 
  LogOut,
  Menu,
  X,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSystemConfig, hasValidCache } from "@/hooks/use-system-config";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { config, loading: configLoading, ready: configReady } = useSystemConfig();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Controlar o estado de carregamento inicial
  useEffect(() => {
    if (configReady) {
      // Pequeno delay para evitar flash
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [configReady]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Sessão encerrada",
      description: "Até logo!",
    });
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Clientes", path: "/clientes" },
    { icon: DollarSign, label: "Empréstimos", path: "/emprestimos" },
    { icon: CreditCard, label: "Pagamentos", path: "/pagamentos" },
    { icon: Settings, label: "Configurações", path: "/configuracoes" },
  ];

  if (!user) {
    return null;
  }

  // Mostrar loading apenas no carregamento inicial
  if (isInitialLoad && !configReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background transition-opacity duration-200 ${isInitialLoad ? 'opacity-0' : 'opacity-100'}`}>
      {/* Sidebar Desktop */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r bg-card">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4 mb-8">
              {config.logo_url ? (
                <img 
                  src={config.logo_url} 
                  alt="Logo" 
                  className="h-10 w-auto mr-3 object-contain"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                  style={{ backgroundColor: config.primary_color }}
                >
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              )}
              <h1 className="text-xl font-bold">{config.system_name}</h1>
            </div>
            <nav className="flex-1 space-y-1 px-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = window.location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-secondary"
                    )}
                    onClick={() => navigate(item.path)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t p-4">
            <div className="flex items-center w-full">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center">
          {config.logo_url ? (
            <img 
              src={config.logo_url} 
              alt="Logo" 
              className="h-8 w-auto mr-2 object-contain"
            />
          ) : (
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center mr-2"
              style={{ backgroundColor: config.primary_color }}
            >
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          )}
          <h1 className="text-lg font-bold">{config.system_name}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-64 bg-card border-r">
            <div className="flex flex-col h-full p-4">
              <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = window.location.pathname === item.path;
                  return (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        isActive && "bg-secondary"
                      )}
                      onClick={() => {
                        navigate(item.path);
                        setSidebarOpen(false);
                      }}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Button>
                  );
                })}
              </nav>
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">{user?.email}</p>
                <Button variant="outline" className="w-full" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Desktop header */}
        <header className="hidden md:flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">
              {window.location.pathname === '/dashboard' && 'Dashboard'}
              {window.location.pathname === '/clientes' && 'Clientes'}
              {window.location.pathname === '/emprestimos' && 'Empréstimos'}
              {window.location.pathname === '/pagamentos' && 'Pagamentos'}
              {window.location.pathname === '/configuracoes' && 'Configurações'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              {user?.email}
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
