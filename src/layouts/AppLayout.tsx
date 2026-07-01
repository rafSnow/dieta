import { Outlet, NavLink, Link } from 'react-router-dom';
import { Sun, Moon, Home, Book, CalendarDays, ShoppingCart, Menu, PieChart, Apple, Tags, ChefHat, Settings, User } from 'lucide-react';
import { useTheme } from '../shared/store/useTheme';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuGroup } from '../components/ui/dropdown-menu';
import { OnboardingModal } from '../components/OnboardingModal';
import { ResumoSemanalModal } from '../components/ResumoSemanalModal';

export function AppLayout() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0">
      <OnboardingModal />
      <ResumoSemanalModal />
      <header className="sticky top-0 z-20 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4 justify-between mx-auto">
          <div className="flex">
            <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold text-primary">NutriFlow</Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              <NavLink to="/" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>Dashboard</NavLink>
              <NavLink to="/diario" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>Diário</NavLink>
              <NavLink to="/planejamento" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>Planejamento</NavLink>
              <NavLink to="/compras" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>Compras</NavLink>
              <NavLink to="/relatorios" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>Relatórios</NavLink>
              <NavLink to="/receitas" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>Receitas</NavLink>
              <NavLink to="/alimentos" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>Alimentos</NavLink>
              <NavLink to="/configuracoes" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>Config</NavLink>
              <NavLink to="/perfil" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>Perfil</NavLink>
            </nav>
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md hover:bg-accent text-foreground"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-4 md:py-6 px-4">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur z-20 h-16 flex items-center justify-around px-2 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-none">
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Início</span>
        </NavLink>
        <NavLink to="/diario" className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
          <Book className="w-5 h-5" />
          <span className="text-[10px] font-medium">Diário</span>
        </NavLink>
        <NavLink to="/planejamento" className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px] font-medium">Plano</span>
        </NavLink>
        <NavLink to="/compras" className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px] font-medium">Compras</span>
        </NavLink>

        {/* Mais Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground outline-none" />}>
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">Mais</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mb-2">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Gestão</DropdownMenuLabel>
              <DropdownMenuItem render={<Link to="/alimentos" className="w-full cursor-pointer flex items-center" />}>
                <Apple className="mr-2 h-4 w-4" /> Alimentos
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link to="/categorias" className="w-full cursor-pointer flex items-center" />}>
                <Tags className="mr-2 h-4 w-4" /> Categorias
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link to="/receitas" className="w-full cursor-pointer flex items-center" />}>
                <ChefHat className="mr-2 h-4 w-4" /> Receitas
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Sistema</DropdownMenuLabel>
              <DropdownMenuItem render={<Link to="/relatorios" className="w-full cursor-pointer flex items-center" />}>
                <PieChart className="mr-2 h-4 w-4" /> Relatórios
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link to="/perfil" className="w-full cursor-pointer flex items-center" />}>
                <User className="mr-2 h-4 w-4" /> Perfil
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link to="/configuracoes" className="w-full cursor-pointer flex items-center" />}>
                <Settings className="mr-2 h-4 w-4" /> Configurações
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
