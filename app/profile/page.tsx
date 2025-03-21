"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useSettings } from "@/context/settings-context"
import NavBar from "@/components/nav-bar"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { AddFinancialGoalDialog } from "@/components/add-financial-goal-dialog"
import {
  Camera,
  User,
  Target,
  Bell,
  Shield,
  FileText,
  Pencil,
  Save,
  Loader2,
  CreditCard,
  Calendar,
  Mail,
  Lock,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  BarChart4,
  Download,
} from "lucide-react"

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth()
  const { translate, formatCurrency } = useSettings()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      })
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <NavBar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!user) {
    router.push("/login")
    return null
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setFormData({
        name: user.name,
        email: user.email,
      })
    }
    setIsEditing(!isEditing)
  }

  const handleSaveProfile = () => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      updateProfile({
        name: formData.name,
        email: formData.email,
      })

      setIsEditing(false)
      setIsSaving(false)

      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente.",
      })
    }, 1000)
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you would upload the file to a server
      // For this demo, we'll just simulate it
      const reader = new FileReader()
      reader.onload = () => {
        updateProfile({
          avatar: reader.result as string,
        })

        toast({
          title: "Foto actualizada",
          description: "Tu foto de perfil ha sido actualizada correctamente.",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <NavBar />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <UserAvatar user={user} className="h-16 w-16 md:h-20 md:w-20" />
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 dark:bg-muted/20"
                onClick={handleAvatarClick}
              >
                <Camera className="h-4 w-4" />
                <span className="sr-only">Cambiar foto</span>
              </Button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              className="flex-1 md:flex-none dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
              onClick={handleEditToggle}
            >
              {isEditing ? (
                <>Cancelar</>
              ) : (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar perfil
                </>
              )}
            </Button>
            {isEditing && (
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 md:flex-none dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 md:w-auto w-full dark:bg-muted/10">
            <TabsTrigger
              value="profile"
              className="dark:data-[state=active]:bg-primary/20 dark:data-[state=active]:text-primary-foreground"
            >
              <User className="h-4 w-4 mr-2 md:mr-0 md:hidden" />
              <span className="md:hidden">Perfil</span>
              <span className="hidden md:inline">Información Personal</span>
            </TabsTrigger>
            <TabsTrigger
              value="goals"
              className="dark:data-[state=active]:bg-primary/20 dark:data-[state=active]:text-primary-foreground"
            >
              <Target className="h-4 w-4 mr-2 md:mr-0 md:hidden" />
              <span className="md:hidden">Metas</span>
              <span className="hidden md:inline">Objetivos Financieros</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="dark:data-[state=active]:bg-primary/20 dark:data-[state=active]:text-primary-foreground"
            >
              <Bell className="h-4 w-4 mr-2 md:mr-0 md:hidden" />
              <span className="md:hidden">Notif.</span>
              <span className="hidden md:inline">Notificaciones</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="dark:data-[state=active]:bg-primary/20 dark:data-[state=active]:text-primary-foreground"
            >
              <Shield className="h-4 w-4 mr-2 md:mr-0 md:hidden" />
              <span className="md:hidden">Seguridad</span>
              <span className="hidden md:inline">Seguridad</span>
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="dark:data-[state=active]:bg-primary/20 dark:data-[state=active]:text-primary-foreground"
            >
              <FileText className="h-4 w-4 mr-2 md:mr-0 md:hidden" />
              <span className="md:hidden">Informes</span>
              <span className="hidden md:inline">Informes Financieros</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="dark:border-border/20 elevated-surface">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary" />
                    Información Personal
                  </CardTitle>
                  <CardDescription>Actualiza tu información personal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="dark:bg-muted/10 dark:border-border/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className="dark:bg-muted/10 dark:border-border/30"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:border-border/20 elevated-surface">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-primary" />
                    Información de Pago
                  </CardTitle>
                  <CardDescription>Administra tus métodos de pago</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border p-3 dark:border-border/30 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-blue-500/20 p-2">
                        <CreditCard className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">Visa terminada en 4242</p>
                        <p className="text-sm text-muted-foreground">Expira 12/2025</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <span>Editar</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="rounded-lg border p-3 dark:border-border/30 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-green-500/20 p-2">
                        <CreditCard className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">Mastercard terminada en 8888</p>
                        <p className="text-sm text-muted-foreground">Expira 08/2024</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <span>Editar</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Añadir método de pago
                  </Button>
                </CardContent>
              </Card>

              <Card className="dark:border-border/20 elevated-surface md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Actividad Reciente
                  </CardTitle>
                  <CardDescription>Historial de actividad de tu cuenta</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-green-500/20 p-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">Transacción completada</p>
                          <p className="text-sm text-muted-foreground">Hace 2 horas</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Transferencia a cuenta de ahorros</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-blue-500/20 p-2">
                        <CreditCard className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">Método de pago actualizado</p>
                          <p className="text-sm text-muted-foreground">Ayer</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Visa terminada en 4242</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-amber-500/20 p-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">Alerta de presupuesto</p>
                          <p className="text-sm text-muted-foreground">Hace 2 días</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Has alcanzado el 80% de tu presupuesto de entretenimiento
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
                  >
                    Ver todo el historial
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <Card className="dark:border-border/20 elevated-surface">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  Objetivos Financieros
                </CardTitle>
                <CardDescription>Administra tus metas financieras</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {user.financialGoals?.map((goal, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{goal.type === "savings" ? "Meta de ahorro" : "Pago de deuda"}</h3>
                        <p className="text-sm text-muted-foreground">
                          {goal.deadline
                            ? `Fecha límite: ${new Date(goal.deadline).toLocaleDateString()}`
                            : "Sin fecha límite"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((goal.current / goal.target) * 100)}% completado
                        </p>
                      </div>
                    </div>
                    <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                  </div>
                ))}
                <AddFinancialGoalDialog />
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="dark:border-border/20 elevated-surface">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart4 className="h-5 w-5 mr-2 text-primary" />
                    Progreso de Objetivos
                  </CardTitle>
                  <CardDescription>Visualización de tu progreso</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
                    <BarChart4 className="h-16 w-16 text-muted" />
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:border-border/20 elevated-surface">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Proyecciones
                  </CardTitle>
                  <CardDescription>Estimaciones de cumplimiento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border p-3 dark:border-border/30">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">Meta de ahorro</p>
                      <p className="text-sm font-medium text-emerald-500">En camino</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Basado en tus ahorros actuales, alcanzarás tu meta en:
                    </p>
                    <p className="text-2xl font-bold">8 meses</p>
                  </div>
                  <div className="rounded-lg border p-3 dark:border-border/30">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">Pago de deuda</p>
                      <p className="text-sm font-medium text-amber-500">Retrasado</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Con pagos actuales, completarás tu meta en:</p>
                    <p className="text-2xl font-bold">14 meses</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="dark:border-border/20 elevated-surface">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-primary" />
                  Preferencias de Notificaciones
                </CardTitle>
                <CardDescription>Configura cómo quieres recibir notificaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="budget-alerts">Alertas de presupuesto</Label>
                      <p className="text-sm text-muted-foreground">
                        Recibe notificaciones cuando te acerques a tu límite de presupuesto
                      </p>
                    </div>
                    <Switch
                      id="budget-alerts"
                      checked={user.notificationPreferences?.budgetAlerts}
                      onCheckedChange={(checked) => {
                        updateProfile({
                          notificationPreferences: {
                            ...user.notificationPreferences,
                            budgetAlerts: checked,
                          },
                        })
                      }}
                    />
                  </div>
                  <Separator className="dark:bg-border/20" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekly-reports">Informes semanales</Label>
                      <p className="text-sm text-muted-foreground">Recibe un resumen semanal de tus finanzas</p>
                    </div>
                    <Switch
                      id="weekly-reports"
                      checked={user.notificationPreferences?.weeklyReports}
                      onCheckedChange={(checked) => {
                        updateProfile({
                          notificationPreferences: {
                            ...user.notificationPreferences,
                            weeklyReports: checked,
                          },
                        })
                      }}
                    />
                  </div>
                  <Separator className="dark:bg-border/20" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="unusual-activity">Actividad inusual</Label>
                      <p className="text-sm text-muted-foreground">
                        Recibe alertas sobre gastos inusuales o sospechosos
                      </p>
                    </div>
                    <Switch
                      id="unusual-activity"
                      checked={user.notificationPreferences?.unusualActivity}
                      onCheckedChange={(checked) => {
                        updateProfile({
                          notificationPreferences: {
                            ...user.notificationPreferences,
                            unusualActivity: checked,
                          },
                        })
                      }}
                    />
                  </div>
                  <Separator className="dark:bg-border/20" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="tips">Consejos financieros</Label>
                      <p className="text-sm text-muted-foreground">
                        Recibe consejos personalizados para mejorar tus finanzas
                      </p>
                    </div>
                    <Switch
                      id="tips"
                      checked={user.notificationPreferences?.tips}
                      onCheckedChange={(checked) => {
                        updateProfile({
                          notificationPreferences: {
                            ...user.notificationPreferences,
                            tips: checked,
                          },
                        })
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:border-border/20 elevated-surface">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-primary" />
                  Canales de Notificación
                </CardTitle>
                <CardDescription>Elige cómo recibir tus notificaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-3 dark:border-border/30 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-blue-500/20 p-2">
                      <Mail className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Correo electrónico</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Switch checked={true} />
                </div>
                <div className="rounded-lg border p-3 dark:border-border/30 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-green-500/20 p-2">
                      <Bell className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Notificaciones push</p>
                      <p className="text-sm text-muted-foreground">En tu navegador y dispositivos</p>
                    </div>
                  </div>
                  <Switch checked={false} />
                </div>
                <div className="rounded-lg border p-3 dark:border-border/30 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-purple-500/20 p-2">
                      <Bell className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">SMS</p>
                      <p className="text-sm text-muted-foreground">No configurado</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
                  >
                    Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card className="dark:border-border/20 elevated-surface">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  Seguridad
                </CardTitle>
                <CardDescription>Administra la seguridad de tu cuenta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Cambiar contraseña</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Última actualización:{" "}
                      {new Date(user.securitySettings?.lastPasswordChange || "").toLocaleDateString()}
                    </p>
                    <Button variant="outline" className="dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20">
                      <Lock className="mr-2 h-4 w-4" />
                      Cambiar contraseña
                    </Button>
                  </div>
                  <Separator className="dark:bg-border/20" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="two-factor">Autenticación de dos factores</Label>
                      <p className="text-sm text-muted-foreground">Añade una capa adicional de seguridad a tu cuenta</p>
                    </div>
                    <Switch
                      id="two-factor"
                      checked={user.securitySettings?.twoFactorEnabled}
                      onCheckedChange={(checked) => {
                        updateProfile({
                          securitySettings: {
                            ...user.securitySettings,
                            twoFactorEnabled: checked,
                          },
                        })

                        toast({
                          title: checked ? "2FA activado" : "2FA desactivado",
                          description: checked
                            ? "La autenticación de dos factores ha sido activada."
                            : "La autenticación de dos factores ha sido desactivada.",
                        })
                      }}
                    />
                  </div>
                  <Separator className="dark:bg-border/20" />
                  <div>
                    <h3 className="font-medium">Sesiones activas</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Administra los dispositivos donde has iniciado sesión
                    </p>
                    <div className="space-y-3">
                      <div className="rounded-lg border p-3 dark:border-border/30 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="rounded-md bg-green-500/20 p-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <p className="font-medium">Este dispositivo</p>
                            <p className="text-sm text-muted-foreground">Última actividad: Ahora</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
                        >
                          Actual
                        </Button>
                      </div>
                      <div className="rounded-lg border p-3 dark:border-border/30 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="rounded-md bg-blue-500/20 p-2">
                            <Shield className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium">iPhone de Alex</p>
                            <p className="text-sm text-muted-foreground">Última actividad: Hace 2 días</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
                        >
                          Cerrar sesión
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card className="dark:border-border/20 elevated-surface">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Informes Financieros
                </CardTitle>
                <CardDescription>Accede a informes detallados sobre tus finanzas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="monthly">
                  <TabsList className="grid w-full grid-cols-3 dark:bg-muted/10">
                    <TabsTrigger
                      value="monthly"
                      className="dark:data-[state=active]:bg-primary/20 dark:data-[state=active]:text-primary-foreground"
                    >
                      Mensual
                    </TabsTrigger>
                    <TabsTrigger
                      value="quarterly"
                      className="dark:data-[state=active]:bg-primary/20 dark:data-[state=active]:text-primary-foreground"
                    >
                      Trimestral
                    </TabsTrigger>
                    <TabsTrigger
                      value="yearly"
                      className="dark:data-[state=active]:bg-primary/20 dark:data-[state=active]:text-primary-foreground"
                    >
                      Anual
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="monthly" className="space-y-4 pt-4">
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <Button
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
                      >
                        <FileText className="h-8 w-8 mb-2" />
                        <span>Resumen de gastos</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
                      >
                        <FileText className="h-8 w-8 mb-2" />
                        <span>Análisis de ingresos</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
                      >
                        <FileText className="h-8 w-8 mb-2" />
                        <span>Tendencias de ahorro</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
                      >
                        <FileText className="h-8 w-8 mb-2" />
                        <span>Reporte completo</span>
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="quarterly" className="space-y-4 pt-4">
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <Button
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
                      >
                        <FileText className="h-8 w-8 mb-2" />
                        <span>Q1 2023</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
                      >
                        <FileText className="h-8 w-8 mb-2" />
                        <span>Q2 2023</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
                      >
                        <FileText className="h-8 w-8 mb-2" />
                        <span>Q3 2023</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
                      >
                        <FileText className="h-8 w-8 mb-2" />
                        <span>Q4 2023</span>
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="yearly" className="space-y-4 pt-4">
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <Button
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
                      >
                        <FileText className="h-8 w-8 mb-2" />
                        <span>Reporte anual 2023</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
                      >
                        <FileText className="h-8 w-8 mb-2" />
                        <span>Reporte anual 2022</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
                      >
                        <FileText className="h-8 w-8 mb-2" />
                        <span>Comparativa anual</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
                      >
                        <FileText className="h-8 w-8 mb-2" />
                        <span>Proyección 2024</span>
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
                <Button className="w-full dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar todos los informes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

