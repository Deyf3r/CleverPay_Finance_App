"use client"

import Link from "next/link"
import {
  WalletIcon,
  BrainCircuitIcon,
  Settings,
  LayoutDashboard,
  Receipt,
  CreditCard,
  Menu,
  User,
  LogOut,
  Bell,
  Shield,
  FileText,
  Target,
} from "lucide-react"
import { useSettings } from "@/context/settings-context"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/context/auth-context"
import { UserAvatar } from "@/components/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export default function NavBar() {
  const { translate } = useSettings()
  const { user, isAuthenticated, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="border-b dark:border-border/20 dark:bg-card">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <WalletIcon className="h-6 w-6" />
          <span>{translate("app.name")}</span>
        </Link>

        {/* Menú móvil */}
        <div className="md:hidden ml-auto flex items-center gap-2">
          {isAuthenticated && (
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link href="/profile">
                {user ? <UserAvatar user={user} className="h-8 w-8" /> : <User className="h-5 w-5" />}
              </Link>
            </Button>
          )}

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="dark:bg-card">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="/"
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/20 text-muted-foreground hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  {translate("nav.overview")}
                </Link>
                <Link
                  href="/transactions"
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/20 text-muted-foreground hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Receipt className="h-5 w-5" />
                  {translate("nav.transactions")}
                </Link>
                <Link
                  href="/ai-insights"
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/20 text-muted-foreground hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BrainCircuitIcon className="h-5 w-5" />
                  {translate("nav.ai_insights")}
                </Link>
                <Link
                  href="/accounts"
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/20 text-muted-foreground hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <CreditCard className="h-5 w-5" />
                  {translate("nav.accounts")}
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/20 text-muted-foreground hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="h-5 w-5" />
                  {translate("nav.settings")}
                </Link>
                {isAuthenticated && (
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/20 text-muted-foreground hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    Perfil
                  </Link>
                )}
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/20 text-muted-foreground hover:text-primary"
                  >
                    <LogOut className="h-5 w-5" />
                    Cerrar sesión
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/20 text-muted-foreground hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    Iniciar sesión
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Menú de escritorio */}
        <nav className="ml-auto hidden md:flex gap-4 sm:gap-6 items-center">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1.5"
          >
            <LayoutDashboard className="h-4 w-4" />
            {translate("nav.overview")}
          </Link>
          <Link
            href="/transactions"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1.5"
          >
            <Receipt className="h-4 w-4" />
            {translate("nav.transactions")}
          </Link>
          <Link
            href="/ai-insights"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1.5"
          >
            <BrainCircuitIcon className="h-4 w-4" />
            {translate("nav.ai_insights")}
          </Link>
          <Link
            href="/accounts"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1.5"
          >
            <CreditCard className="h-4 w-4" />
            {translate("nav.accounts")}
          </Link>
          <Link
            href="/settings"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1.5"
          >
            <Settings className="h-4 w-4" />
            {translate("nav.settings")}
          </Link>
          <ThemeSwitcher />

          {isAuthenticated ? (
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="rounded-full mr-2" asChild>
                <Link href="/profile">
                  {user ? <UserAvatar user={user} className="h-8 w-8" /> : <User className="h-5 w-5" />}
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <span className="hidden sm:inline-block">{user?.name.split(" ")[0]}</span>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                    >
                      <path
                        d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 dark:bg-card">
                  <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/goals" className="cursor-pointer">
                        <Target className="mr-2 h-4 w-4" />
                        <span>Objetivos financieros</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/notifications" className="cursor-pointer">
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Notificaciones</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/security" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Seguridad</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/reports" className="cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Informes</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button asChild variant="outline" size="sm" className="ml-2">
              <Link href="/login">
                <User className="mr-2 h-4 w-4" />
                Iniciar sesión
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </div>
  )
}

