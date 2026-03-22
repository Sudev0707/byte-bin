import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearSession } from "@/utils/localStorage";
import { useAuth, useUser, UserButton } from "@clerk/clerk-react";
import {
  Code2,
  LayoutDashboard,
  Plus,
  List,
  BarChart3,
  User,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Add Problem", to: "/add", icon: Plus },
  { label: "Problem List", to: "/problems", icon: List },
  { label: "Statistics", to: "/statistics", icon: BarChart3 },
  // { label: "Profile", to: "/profile", icon: User },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const { isLoaded, user } = useUser();

  const getUserInitials = () => {
    const firstName = user?.firstName?.[0]?.toUpperCase() || '';
    const lastName = user?.lastName?.[0]?.toUpperCase() || '';
    return firstName + lastName || 'U';
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      // Fallback to local session clear if Clerk signout fails
      console.error("Clerk signout error:", error);
    }
    clearSession();
    navigate("/login");
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-sidebar border-b border-sidebar-border">
        <div className="flex h-full items-center justify-between px-10">
          <div className="flex gap-14">
            {/* Logo and Brand */}
            <div className="flex items-center gap-2">
              {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg">
                <Code2 className="h-4 w-4 text-sidebar-primary-foreground" />
              </div> */}
              <span className="text-4xl font-bold text-sidebar-accent-foreground font-display hidden sm:inline">
                byte<span className=" text-violet-600">Bin</span>
              </span>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-lg font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Menu & Logout Button */}
          <div className="flex items-center gap-2">
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                  size="icon"
                >
                  <Avatar className="h-8 w-8">
                    {isLoaded && user?.imageUrl && (
                      <AvatarImage src={user.imageUrl} />
                    )}
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {isLoaded ? user?.fullName || user?.username || 'User' : 'Loading...'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {isLoaded ? user?.primaryEmailAddress?.emailAddress || 'No email' : ''}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>View Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="focus:bg-destructive focus:text-destructive-foreground"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-14 left-0 right-0 bg-sidebar border-b border-sidebar-border shadow-lg">
            <nav className="flex flex-col px-3 py-2">
              {navItems.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default AppSidebar;
