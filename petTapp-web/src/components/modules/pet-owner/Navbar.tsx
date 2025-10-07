import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  Home,
  Calendar,
  PawPrint,
  User,
  LogOut,
  Menu,
  Building,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/store/authStore";
import { ModeToggle } from "@/components/mode-toggle";
import { SearchInput } from "@/components/search-input";
import { cn } from "@/lib/utils";
import { useGetProfile } from "@/lib/query/useUser";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { data: profileData } = useGetProfile();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSearch = (value: string) => {
    navigate(`/pet-owner/search?q=${encodeURIComponent(value)}`);
  };

  const desktopActiveMenu = ({ isActive }: { isActive: boolean }) => {
    return cn(
      "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20",
      isActive && "bg-white/20"
    );
  };

  const mobileActiveMenu = ({ isActive }: { isActive: boolean }) => {
    return cn(
      "inline-flex items-center gap-2 rounded-md px-4 py-4 text-sm font-medium transition-colors hover:bg-blue-300 dark:hover:bg-blue-900",
      isActive && "bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white"
    );
  };

  const getInitials = () => {
    if (profileData?.user?.firstName && profileData?.user?.lastName) {
      return `${profileData.user.firstName[0]}${profileData.user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  const getFullName = () => {
    const { firstName, middleName, lastName, suffix } = profileData?.user || {};

    if (!firstName && !lastName) {
      return profileData?.user?.email || user?.email || "User";
    }

    const nameParts = [
      firstName,
      middleName,
      lastName,
      suffix
    ].filter(Boolean);

    return nameParts.join(" ");
  };

  return (
    <>
      <nav className="border-b bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Left Side: Logo & Nav Links */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <Link to="/pet-owner" className="flex items-center gap-3">
                <img
                  src="/PetTapp-logo.png"
                  alt="PetTapp Logo"
                  className="w-10 bg-white rounded-full"
                />
                <span className="text-xl font-bold lg:block hidden">
                  PetTapp
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-1 pl-8">
                <NavLink to="/pet-owner" end className={desktopActiveMenu}>
                  <Home className="h-4 w-4" />
                  Home
                </NavLink>
                <NavLink to="/pet-owner/services" className={desktopActiveMenu}>
                  <PawPrint className="h-4 w-4" />
                  Services
                </NavLink>
                <NavLink
                  to="/pet-owner/schedules"
                  className={desktopActiveMenu}
                >
                  <Calendar className="h-4 w-4" />
                  Schedules
                </NavLink>
                <NavLink
                  to="/pet-owner/businesses"
                  end
                  className={desktopActiveMenu}
                >
                  <Building className="h-4 w-4" />
                  Businesses
                </NavLink>
              </div>
            </div>

            {/* Right Side: Notifications & Avatar Dropdown */}
            <div className="flex items-center gap-2">
              <div className="hidden md:block">
                <SearchInput
                  placeholder="Search services..."
                  onSearch={handleSearch}
                />
              </div>

              <div className="md:hidden">
                <SearchInput placeholder="Search..." onSearch={handleSearch} />
              </div>

              <ModeToggle />

              <Button variant="ghost" size="icon" asChild>
                <Link to="/pet-owner/notifications">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar>
                      <AvatarImage
                        className="object-cover"
                        src={profileData?.user?.images?.profile}
                        alt={user?.email || "User"}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{getFullName()}</p>
                      <p className="text-xs text-muted-foreground">
                        {profileData?.user?.email || user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/pet-owner/my-pets" className="cursor-pointer">
                      <PawPrint className="mr-2 h-4 w-4" />
                      My Pets
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/pet-owner/my-account" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                    variant="destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[280px]">
          <SheetHeader>
            <SheetTitle>PetTapp</SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-1 p-2">
            <NavLink
              to="/pet-owner"
              end
              onClick={() => setIsOpen(false)}
              className={mobileActiveMenu}
            >
              <Home className="h-5 w-5" />
              Home
            </NavLink>
            <NavLink
              to="/pet-owner/services"
              onClick={() => setIsOpen(false)}
              className={mobileActiveMenu}
            >
              <PawPrint className="h-5 w-5" />
              Services
            </NavLink>
            <NavLink
              to="/pet-owner/schedules"
              onClick={() => setIsOpen(false)}
              className={mobileActiveMenu}
            >
              <Calendar className="h-5 w-5" />
              Schedules
            </NavLink>
            <NavLink
              to="/pet-owner/businesses"
              onClick={() => setIsOpen(false)}
              className={mobileActiveMenu}
            >
              <Building className="h-5 w-5" />
              Businesses
            </NavLink>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Navbar;
