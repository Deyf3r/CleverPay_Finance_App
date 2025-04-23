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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { AddFinancialGoalDialog } from "@/components/add-financial-goal-dialog"
import { SubscriptionPlansModal } from "@/components/subscription-plans-modal"
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
  Eye,
  EyeOff,
  LogOut,
  Smartphone,
  Clock,
  Search,
  X,
  MoreHorizontal,
  Star,
  FileDown,
  FileTextIcon,
  TrendingUp,
  TrendingDown,
  Info,
  Wallet,
  Crown,
  Sparkles,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Componente para añadir método de pago
const AddPaymentMethodDialog = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    saveCard: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulamos una petición a la API
    setTimeout(() => {
      setIsLoading(false)
      setIsOpen(false)

      toast({
        title: "Método de pago añadido",
        description: "Tu tarjeta ha sido añadida correctamente.",
      })
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-sky-50 hover:from-emerald-100 hover:to-sky-100 dark:from-emerald-950/30 dark:to-sky-950/30 dark:hover:from-emerald-950/50 dark:hover:to-sky-950/50 border border-emerald-200/50 dark:border-emerald-800/30 shadow-sm"
        >
          <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Añadir método de pago
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900/90 backdrop-blur-sm border-slate-200/60 dark:border-slate-800/60 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
            <CreditCard className="h-5 w-5 text-emerald-500" />
            Añadir método de pago
          </DialogTitle>
          <DialogDescription>Añade una nueva tarjeta de crédito o débito a tu cuenta.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="text-slate-700 dark:text-slate-300">
                Número de tarjeta
              </Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardData.cardNumber}
                onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardName" className="text-slate-700 dark:text-slate-300">
                Nombre en la tarjeta
              </Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={cardData.cardName}
                onChange={(e) => setCardData({ ...cardData, cardName: e.target.value })}
                className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="text-slate-700 dark:text-slate-300">
                  Fecha de expiración
                </Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/AA"
                  value={cardData.expiryDate}
                  onChange={(e) => setCardData({ ...cardData, expiryDate: e.target.value })}
                  className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv" className="text-slate-700 dark:text-slate-300">
                  CVV
                </Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                  className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                  required
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="saveCard"
                checked={cardData.saveCard}
                onCheckedChange={(checked) => setCardData({ ...cardData, saveCard: checked as boolean })}
                className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
              <label
                htmlFor="saveCard"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300"
              >
                Guardar esta tarjeta para futuros pagos
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Añadir tarjeta"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Componente para ver el historial completo
const ViewHistoryDialog = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const { formatCurrency } = useSettings()

  // Datos de ejemplo para el historial
  const historyItems = [
    {
      id: "1",
      type: "transaction",
      title: "Transferencia completada",
      description: "Transferencia a cuenta de ahorros",
      amount: 500,
      date: new Date(2023, 3, 15),
      status: "success",
    },
    {
      id: "2",
      type: "payment",
      title: "Método de pago actualizado",
      description: "Visa terminada en 4242",
      date: new Date(2023, 3, 14),
      status: "info",
    },
    {
      id: "3",
      type: "alert",
      title: "Alerta de presupuesto",
      description: "Has alcanzado el 80% de tu presupuesto de entretenimiento",
      date: new Date(2023, 3, 12),
      status: "warning",
    },
    {
      id: "4",
      type: "transaction",
      title: "Pago recibido",
      description: "Depósito de nómina",
      amount: 2500,
      date: new Date(2023, 3, 10),
      status: "success",
    },
    {
      id: "5",
      type: "security",
      title: "Inicio de sesión detectado",
      description: "Nuevo inicio de sesión desde Chrome en Windows",
      date: new Date(2023, 3, 8),
      status: "info",
    },
    {
      id: "6",
      type: "transaction",
      title: "Pago rechazado",
      description: "Intento de pago a Tienda Online",
      amount: 129.99,
      date: new Date(2023, 3, 7),
      status: "error",
    },
    {
      id: "7",
      type: "alert",
      title: "Transacción inusual detectada",
      description: "Pago de $899.99 a Electrónica Premium",
      date: new Date(2023, 3, 5),
      status: "warning",
    },
    {
      id: "8",
      type: "transaction",
      title: "Transferencia enviada",
      description: "Transferencia a Juan Pérez",
      amount: 150,
      date: new Date(2023, 3, 3),
      status: "success",
    },
    {
      id: "9",
      type: "payment",
      title: "Tarjeta añadida",
      description: "Mastercard terminada en 8888",
      date: new Date(2023, 3, 1),
      status: "info",
    },
    {
      id: "10",
      type: "security",
      title: "Contraseña actualizada",
      description: "Has cambiado tu contraseña correctamente",
      date: new Date(2023, 2, 28),
      status: "success",
    },
  ]

  // Filtrar elementos según el filtro y término de búsqueda
  const filteredItems = historyItems.filter((item) => {
    const matchesFilter = filter === "all" || item.type === filter
    const matchesSearch =
      searchTerm === "" ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Función para renderizar el icono según el tipo y estado
  const renderIcon = (item: (typeof historyItems)[0]) => {
    switch (item.status) {
      case "success":
        return (
          <div className="rounded-full bg-emerald-500/20 p-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
        )
      case "warning":
        return (
          <div className="rounded-full bg-amber-500/20 p-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
        )
      case "error":
        return (
          <div className="rounded-full bg-rose-500/20 p-2">
            <X className="h-4 w-4 text-rose-500" />
          </div>
        )
      case "info":
      default:
        if (item.type === "payment") {
          return (
            <div className="rounded-full bg-blue-500/20 p-2">
              <CreditCard className="h-4 w-4 text-blue-500" />
            </div>
          )
        } else if (item.type === "security") {
          return (
            <div className="rounded-full bg-purple-500/20 p-2">
              <Shield className="h-4 w-4 text-purple-500" />
            </div>
          )
        } else {
          return (
            <div className="rounded-full bg-slate-500/20 p-2">
              <Info className="h-4 w-4 text-slate-500" />
            </div>
          )
        }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 dark:from-slate-900/50 dark:to-slate-800/50 dark:hover:from-slate-900/70 dark:hover:to-slate-800/70 border border-slate-200/70 dark:border-slate-700/50"
        >
          Ver todo el historial
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900/90 backdrop-blur-sm border-slate-200/60 dark:border-slate-800/60 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-400 dark:to-slate-200 bg-clip-text text-transparent">
            <Clock className="h-5 w-5 text-slate-700 dark:text-slate-400" />
            Historial de actividad
          </DialogTitle>
          <DialogDescription>Revisa todas las actividades y transacciones de tu cuenta.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <Input
              placeholder="Buscar en el historial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px] bg-white/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="transaction">Transacciones</SelectItem>
              <SelectItem value="payment">Métodos de pago</SelectItem>
              <SelectItem value="alert">Alertas</SelectItem>
              <SelectItem value="security">Seguridad</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-y-auto pr-2 flex-1 -mr-2">
          <div className="space-y-3">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {renderIcon(item)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {format(item.date, "d 'de' MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
                    {item.amount !== undefined && (
                      <p
                        className={`text-sm font-medium ${
                          item.type === "transaction" && item.status === "success"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {item.type === "transaction" && item.status === "success" ? "+" : "-"}
                        {formatCurrency(item.amount)}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Search className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No se encontraron resultados</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                  No hay actividades que coincidan con tu búsqueda. Intenta con otros términos o elimina los filtros.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            Cerrar
          </Button>
          <Button
            className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white dark:from-slate-700 dark:to-slate-800"
            onClick={() => {
              toast({
                title: "Historial exportado",
                description: "El historial ha sido exportado correctamente.",
              })
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar historial
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Componente para descargar informes financieros
const DownloadReportDialog = ({ type }: { type: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [reportFormat, setReportFormat] = useState("pdf")
  const [dateRange, setDateRange] = useState("current")
  const [includeDetails, setIncludeDetails] = useState(true)

  const getReportTitle = () => {
    switch (type) {
      case "monthly":
        return "Informe Mensual"
      case "quarterly":
        return "Informe Trimestral"
      case "yearly":
        return "Informe Anual"
      case "expenses":
        return "Resumen de Gastos"
      case "income":
        return "Análisis de Ingresos"
      case "savings":
        return "Tendencias de Ahorro"
      case "complete":
        return "Reporte Financiero Completo"
      default:
        return "Informe Financiero"
    }
  }

  const getReportIcon = () => {
    switch (type) {
      case "expenses":
        return <TrendingDown className="h-5 w-5 text-rose-500" />
      case "income":
        return <TrendingUp className="h-5 w-5 text-emerald-500" />
      case "savings":
        return <Wallet className="h-5 w-5 text-amber-500" />
      case "complete":
        return <FileTextIcon className="h-5 w-5 text-blue-500" />
      default:
        return <FileTextIcon className="h-5 w-5 text-slate-500" />
    }
  }

  const handleDownload = () => {
    setIsLoading(true)

    // Simulamos la descarga
    setTimeout(() => {
      setIsLoading(false)
      setIsOpen(false)

      toast({
        title: "Informe descargado",
        description: `El ${getReportTitle().toLowerCase()} ha sido descargado correctamente.`,
      })
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-24 flex flex-col items-center justify-center bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 dark:from-slate-900/50 dark:to-slate-800/50 dark:hover:from-slate-900/70 dark:hover:to-slate-800/70 border border-slate-200/70 dark:border-slate-700/50"
        >
          <FileTextIcon className="h-8 w-8 mb-2 text-slate-700 dark:text-slate-300" />
          <span>{getReportTitle()}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900/90 backdrop-blur-sm border-slate-200/60 dark:border-slate-800/60 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-400 dark:to-slate-200 bg-clip-text text-transparent">
            {getReportIcon()}
            Descargar {getReportTitle()}
          </DialogTitle>
          <DialogDescription>Personaliza y descarga tu informe financiero.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300">Formato del informe</Label>
            <div className="flex gap-4">
              <div
                className={`flex-1 flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all ${
                  reportFormat === "pdf"
                    ? "border-slate-900 dark:border-slate-200 bg-slate-100 dark:bg-slate-800"
                    : "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
                onClick={() => setReportFormat("pdf")}
              >
                <FileDown className="h-8 w-8 mb-1 text-slate-700 dark:text-slate-300" />
                <span className="text-sm font-medium">PDF</span>
              </div>
              <div
                className={`flex-1 flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all ${
                  reportFormat === "excel"
                    ? "border-slate-900 dark:border-slate-200 bg-slate-100 dark:bg-slate-800"
                    : "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
                onClick={() => setReportFormat("excel")}
              >
                <FileDown className="h-8 w-8 mb-1 text-green-600 dark:text-green-500" />
                <span className="text-sm font-medium">Excel</span>
              </div>
              <div
                className={`flex-1 flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all ${
                  reportFormat === "csv"
                    ? "border-slate-900 dark:border-slate-200 bg-slate-100 dark:bg-slate-800"
                    : "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
                onClick={() => setReportFormat("csv")}
              >
                <FileDown className="h-8 w-8 mb-1 text-blue-600 dark:text-blue-500" />
                <span className="text-sm font-medium">CSV</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300">Período de tiempo</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="bg-white/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Selecciona un período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Período actual</SelectItem>
                <SelectItem value="last">Período anterior</SelectItem>
                <SelectItem value="last3">Últimos 3 períodos</SelectItem>
                <SelectItem value="last6">Últimos 6 períodos</SelectItem>
                <SelectItem value="last12">Últimos 12 períodos</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="includeDetails"
              checked={includeDetails}
              onCheckedChange={(checked) => setIncludeDetails(checked as boolean)}
              className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 dark:data-[state=checked]:bg-slate-200 dark:data-[state=checked]:border-slate-200 dark:data-[state=checked]:text-slate-900"
            />
            <label
              htmlFor="includeDetails"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300"
            >
              Incluir detalles de transacciones
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isLoading}
            className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white dark:from-slate-700 dark:to-slate-800"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Descargar informe
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Componente para cambiar contraseña
const ChangePasswordDialog = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const validateForm = () => {
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
    let isValid = true

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "La contraseña actual es requerida"
      isValid = false
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "La nueva contraseña es requerida"
      isValid = false
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "La contraseña debe tener al menos 8 caracteres"
      isValid = false
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu nueva contraseña"
      isValid = false
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    // Simulamos una petición a la API
    setTimeout(() => {
      setIsLoading(false)
      setIsOpen(false)

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada correctamente.",
      })

      // Limpiar el formulario
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 dark:from-slate-900/50 dark:to-slate-800/50 dark:hover:from-slate-900/70 dark:hover:to-slate-800/70 border border-slate-200/70 dark:border-slate-700/50"
        >
          <Lock className="mr-2 h-4 w-4 text-slate-700 dark:text-slate-300" />
          Cambiar contraseña
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900/90 backdrop-blur-sm border-slate-200/60 dark:border-slate-800/60 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-400 dark:to-slate-200 bg-clip-text text-transparent">
            <Lock className="h-5 w-5 text-slate-700 dark:text-slate-400" />
            Cambiar contraseña
          </DialogTitle>
          <DialogDescription>Actualiza tu contraseña para mantener tu cuenta segura.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-slate-700 dark:text-slate-300">
                Contraseña actual
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className={`bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 pr-10 ${
                    errors.currentPassword ? "border-rose-500 dark:border-rose-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-sm text-rose-500">{errors.currentPassword}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-slate-700 dark:text-slate-300">
                Nueva contraseña
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className={`bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 pr-10 ${
                    errors.newPassword ? "border-rose-500 dark:border-rose-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword ? (
                <p className="text-sm text-rose-500">{errors.newPassword}</p>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  La contraseña debe tener al menos 8 caracteres.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">
                Confirmar nueva contraseña
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className={`bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 pr-10 ${
                    errors.confirmPassword ? "border-rose-500 dark:border-rose-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-rose-500">{errors.confirmPassword}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white dark:from-slate-700 dark:to-slate-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar contraseña"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function ProfilePage() {
  const { user, updateProfile, isLoading, logout } = useAuth()
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
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

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
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-slate-600 dark:text-slate-400">Cargando tu perfil...</p>
          </div>
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

  const getPlanName = (planId?: string) => {
    switch (planId) {
      case "free":
        return "Free"
      case "pro":
        return "Pro"
      case "premium":
        return "Premium"
      default:
        return "Free"
    }
  }

  const getPlanBadge = (planId?: string) => {
    switch (planId) {
      case "free":
        return (
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-900/50"
          >
            Plan Free
          </Badge>
        )
      case "pro":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50"
          >
            Plan Pro
          </Badge>
        )
      case "premium":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50"
          >
            Plan Premium
          </Badge>
        )
      default:
        return (
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-900/50"
          >
            Plan Free
          </Badge>
        )
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <NavBar />
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <UserAvatar
                user={user}
                className="h-20 w-20 md:h-24 md:w-24 border-4 border-white dark:border-slate-800 shadow-md"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-white dark:bg-slate-800 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                onClick={handleAvatarClick}
              >
                <Camera className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                <span className="sr-only">Cambiar foto</span>
              </Button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                {user.name}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {getPlanBadge(user.subscriptionPlan)}
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"
                >
                  <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                  4.9
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
            <Button
              variant="outline"
              className="flex-1 md:flex-none bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700"
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
            {isEditing ? (
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 md:flex-none bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white"
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
            ) : (
              <Button
                variant="outline"
                className="flex-1 md:flex-none bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 dark:text-rose-400 dark:hover:text-rose-300 dark:border-rose-900/50"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-white dark:bg-slate-900/80 p-1 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800/50">
            <TabsList className="grid grid-cols-5 w-full bg-slate-100 dark:bg-slate-800/50 p-1 rounded-md">
              <TabsTrigger
                value="profile"
                className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm"
              >
                <User className="h-4 w-4 mr-2 md:mr-2" />
                <span className="hidden md:inline">Información Personal</span>
                <span className="md:hidden">Perfil</span>
              </TabsTrigger>
              <TabsTrigger
                value="goals"
                className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm"
              >
                <Target className="h-4 w-4 mr-2 md:mr-2" />
                <span className="hidden md:inline">Objetivos Financieros</span>
                <span className="md:hidden">Metas</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm"
              >
                <Bell className="h-4 w-4 mr-2 md:mr-2" />
                <span className="hidden md:inline">Notificaciones</span>
                <span className="md:hidden">Notif.</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm"
              >
                <Shield className="h-4 w-4 mr-2 md:mr-2" />
                <span className="hidden md:inline">Seguridad</span>
                <span className="md:hidden">Seguridad</span>
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm"
              >
                <FileText className="h-4 w-4 mr-2 md:mr-2" />
                <span className="hidden md:inline">Informes Financieros</span>
                <span className="md:hidden">Informes</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="overflow-hidden border-slate-200 dark:border-slate-800/60 shadow-md">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/80 pb-4">
                  <CardTitle className="flex items-center text-xl">
                    <User className="h-5 w-5 mr-2 text-slate-700 dark:text-slate-300" />
                    Información Personal
                  </CardTitle>
                  <CardDescription>Actualiza tu información personal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">
                      Nombre completo
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                      Correo electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-slate-200 dark:border-slate-800/60 shadow-md">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/80 pb-4">
                  <CardTitle className="flex items-center text-xl">
                    <CreditCard className="h-5 w-5 mr-2 text-slate-700 dark:text-slate-300" />
                    Métodos de Pago
                  </CardTitle>
                  <CardDescription>Administra tus métodos de pago</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="rounded-lg border p-3 border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/30 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-blue-500/20 p-2">
                        <CreditCard className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">Visa terminada en 4242</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Expira 12/2025</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1 text-slate-700 dark:text-slate-300">
                      <span>Editar</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="rounded-lg border p-3 border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/30 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-green-500/20 p-2">
                        <CreditCard className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">Mastercard terminada en 8888</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Expira 08/2024</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1 text-slate-700 dark:text-slate-300">
                      <span>Editar</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <AddPaymentMethodDialog />
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-slate-200 dark:border-slate-800/60 shadow-md">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/80 pb-4">
                  <CardTitle className="flex items-center text-xl">
                    <Crown className="h-5 w-5 mr-2 text-slate-700 dark:text-slate-300" />
                    Plan de Suscripción
                  </CardTitle>
                  <CardDescription>Administra tu plan de suscripción</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="rounded-lg border p-4 border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/30 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-md p-2 ${
                          user.subscriptionPlan === "free"
                            ? "bg-slate-500/20"
                            : user.subscriptionPlan === "pro"
                              ? "bg-blue-500/20"
                              : "bg-purple-500/20"
                        }`}
                      >
                        {user.subscriptionPlan === "free" ? (
                          <Star className={`h-5 w-5 ${user.subscriptionPlan === "free" ? "text-slate-500" : ""}`} />
                        ) : user.subscriptionPlan === "pro" ? (
                          <Crown className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Sparkles className="h-5 w-5 text-purple-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          Plan {getPlanName(user.subscriptionPlan)}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {user.subscriptionPlan === "free"
                            ? "Plan básico con funcionalidades limitadas"
                            : user.subscriptionPlan === "pro"
                              ? "Plan avanzado con análisis detallados"
                              : "Plan premium con todas las funcionalidades"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 dark:from-slate-900/50 dark:to-slate-800/50 dark:hover:from-slate-900/70 dark:hover:to-slate-800/70 border border-slate-200/70 dark:border-slate-700/50"
                      onClick={() => setShowSubscriptionModal(true)}
                    >
                      Cambiar Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-slate-200 dark:border-slate-800/60 shadow-md md:col-span-2">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/80 pb-4">
                  <CardTitle className="flex items-center text-xl">
                    <Calendar className="h-5 w-5 mr-2 text-slate-700 dark:text-slate-300" />
                    Actividad Reciente
                  </CardTitle>
                  <CardDescription>Historial de actividad de tu cuenta</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-emerald-500/20 p-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-slate-900 dark:text-slate-100">Transacción completada</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Hace 2 horas</p>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Transferencia a cuenta de ahorros</p>
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          +{formatCurrency(500)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-blue-500/20 p-2">
                        <CreditCard className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-slate-900 dark:text-slate-100">Método de pago actualizado</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Ayer</p>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Visa terminada en 4242</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-amber-500/20 p-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-slate-900 dark:text-slate-100">Alerta de presupuesto</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Hace 2 días</p>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          Has alcanzado el 80% de tu presupuesto de entretenimiento
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/80 pt-4">
                  <ViewHistoryDialog />
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6 mt-6">
            <Card className="overflow-hidden border-slate-200 dark:border-slate-800/60 shadow-md">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/80 pb-4">
                <CardTitle className="flex items-center text-xl">
                  <Target className="h-5 w-5 mr-2 text-slate-700 dark:text-slate-300" />
                  Objetivos Financieros
                </CardTitle>
                <CardDescription>Administra tus metas financieras</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {user.financialGoals?.map((goal, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">
                          {goal.type === "savings" ? "Meta de ahorro" : "Pago de deuda"}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {goal.deadline
                            ? `Fecha límite: ${new Date(goal.deadline).toLocaleDateString()}`
                            : "Sin fecha límite"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {Math.round((goal.current / goal.target) * 100)}% completado
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={(goal.current / goal.target) * 100}
                      className="h-2 bg-slate-200 dark:bg-slate-700"
                      indicatorClassName={goal.type === "savings" ? "bg-emerald-500" : "bg-blue-500"}
                    />
                  </div>
                ))}
                <AddFinancialGoalDialog />
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="overflow-hidden border-slate-200 dark:border-slate-800/60 shadow-md">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/80 pb-4">
                  <CardTitle className="flex items-center text-xl">
                    <BarChart4 className="h-5 w-5 mr-2 text-slate-700 dark:text-slate-300" />
                    Progreso de Objetivos
                  </CardTitle>
                  <CardDescription>Visualización de tu progreso</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[250px] flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/30 rounded-md">
                    <div className="w-full h-full p-4">
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-slate-500 dark:text-slate-400">Meta de ahorro</span>
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">35%</span>
                        </div>
                        <div className="w-full h-8 bg-slate-200 dark:bg-slate-700 rounded-md mb-4">
                          <div className="h-full bg-emerald-500 rounded-md" style={{ width: "35%" }}></div>
                        </div>

                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-slate-500 dark:text-slate-400">Pago de deuda</span>
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">40%</span>
                        </div>
                        <div className="w-full h-8 bg-slate-200 dark:bg-slate-700 rounded-md mb-4">
                          <div className="h-full bg-blue-500 rounded-md" style={{ width: "40%" }}></div>
                        </div>

                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-slate-500 dark:text-slate-400">Fondo de emergencia</span>
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">75%</span>
                        </div>
                        <div className="w-full h-8 bg-slate-200 dark:bg-slate-700 rounded-md mb-4">
                          <div className="h-full bg-amber-500 rounded-md" style={{ width: "75%" }}></div>
                        </div>

                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-slate-500 dark:text-slate-400">Inversiones</span>
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">20%</span>
                        </div>
                        <div className="w-full h-8 bg-slate-200 dark:bg-slate-700 rounded-md">
                          <div className="h-full bg-purple-500 rounded-md" style={{ width: "20%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-slate-200 dark:border-slate-800/60 shadow-md">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/80 pb-4">
                  <CardTitle className="flex items-center text-xl">
                    <Calendar className="h-5 w-5 mr-2 text-slate-700 dark:text-slate-300" />
                    Proyecciones
                  </CardTitle>
                  <CardDescription>Estimaciones de cumplimiento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="rounded-lg border p-4 border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/30">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-slate-900 dark:text-slate-100">Meta de ahorro</p>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-950/70 border-0">
                        En camino
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                      Basado en tus ahorros actuales, alcanzarás tu meta en:
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">8 meses</p>
                  </div>
                  <div className="rounded-lg border p-4 border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/30">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-slate-900 dark:text-slate-100">Pago de deuda</p>
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:hover:bg-amber-950/70 border-0">
                        Retrasado
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                      Con pagos actuales, completarás tu meta en:
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">14 meses</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card className="overflow-hidden border-slate-200 dark:border-slate-800/60 shadow-md">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/80 pb-4">
                <CardTitle className="flex items-center text-xl">
                  <Bell className="h-5 w-5 mr-2 text-slate-700 dark:text-slate-300" />
                  Preferencias de Notificaciones
                </CardTitle>
                <CardDescription>Configura cómo quieres recibir notificaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="budget-alerts" className="text-slate-900 dark:text-slate-100">
                        Alertas de presupuesto
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
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

                        toast({
                          title: checked ? "Alertas activadas" : "Alertas desactivadas",
                          description: checked
                            ? "Recibirás alertas cuando te acerques a tu límite de presupuesto."
                            : "Ya no recibirás alertas de presupuesto.",
                        })
                      }}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                  <Separator className="bg-slate-200 dark:bg-slate-700/50" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekly-reports" className="text-slate-900 dark:text-slate-100">
                        Informes semanales
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Recibe un resumen semanal de tus finanzas
                      </p>
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

                        toast({
                          title: checked ? "Informes activados" : "Informes desactivados",
                          description: checked
                            ? "Recibirás un resumen semanal de tus finanzas."
                            : "Ya no recibirás informes semanales.",
                        })
                      }}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                  <Separator className="bg-slate-200 dark:bg-slate-700/50" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="unusual-activity" className="text-slate-900 dark:text-slate-100">
                        Actividad inusual
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
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

                        toast({
                          title: checked ? "Alertas activadas" : "Alertas desactivadas",
                          description: checked
                            ? "Recibirás alertas sobre actividad inusual en tu cuenta."
                            : "Ya no recibirás alertas de actividad inusual.",
                        })
                      }}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                  <Separator className="bg-slate-200 dark:bg-slate-700/50" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="tips" className="text-slate-900 dark:text-slate-100">
                        Consejos financieros
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
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

                        toast({
                          title: checked ? "Consejos activados" : "Consejos desactivados",
                          description: checked
                            ? "Recibirás consejos personalizados para mejorar tus finanzas."
                            : "Ya no recibirás consejos financieros.",
                        })
                      }}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-slate-200 dark:border-slate-800/60 shadow-md">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/80 pb-4">
                <CardTitle className="flex items-center text-xl">
                  <Mail className="h-5 w-5 mr-2 text-slate-700 dark:text-slate-300" />
                  Canales de Notificación
                </CardTitle>
                <CardDescription>Elige cómo recibir tus notificaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/30 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-blue-500/20 p-2">
                        <Mail className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">Correo electrónico</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <Switch
                      checked={true}
                      onCheckedChange={(checked) => {
                        toast({
                          title: checked ? "Email activado" : "Email desactivado",
                          description: checked
                            ? "Recibirás notificaciones por correo electrónico."
                            : "Ya no recibirás notificaciones por correo electrónico.",
                        })
                      }}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                  <div className="rounded-lg border p-4 border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/30 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-green-500/20 p-2">
                        <Bell className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">Notificaciones push</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">En tu navegador y dispositivos</p>
                      </div>
                    </div>
                    <Switch
                      checked={false}
                      onCheckedChange={(checked) => {
                        toast({
                          title: checked ? "Notificaciones push activadas" : "Notificaciones push desactivadas",
                          description: checked
                            ? "Recibirás notificaciones push en tu navegador y dispositivos."
                            : "Ya no recibirás notificaciones push.",
                        })
                      }}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                  <div className="rounded-lg border p-4 border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/30 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-purple-500/20 p-2">
                        <Smartphone className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">SMS</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">No configurado</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700"
                      onClick={() => {
                        toast({
                          title: "Configuración de SMS",
                          description: "Próximamente podrás configurar notificaciones por SMS.",
                        })
                      }}
                    >
                      Configurar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-6">
            <Card className="overflow-hidden border-slate-200 dark:border-slate-800/60 shadow-md">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/80 pb-4">
                <CardTitle className="flex items-center text-xl">
                  <Shield className="h-5 w-5 mr-2 text-slate-700 dark:text-slate-300" />
                  Seguridad
                </CardTitle>
                <CardDescription>Administra la seguridad de tu cuenta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">Cambiar contraseña</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      Última actualización:{" "}
                      {new Date(user.securitySettings?.lastPasswordChange || "").toLocaleDateString()}
                    </p>
                    <ChangePasswordDialog />
                  </div>
                  <Separator className="bg-slate-200 dark:bg-slate-700/50" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="two-factor" className="text-slate-900 dark:text-slate-100">
                        Autenticación de dos factores
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Añade una capa adicional de seguridad a tu cuenta
                      </p>
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
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                  <Separator className="bg-slate-200 dark:bg-slate-700/50" />
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">Sesiones activas</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      Administra los dispositivos donde has iniciado sesión
                    </p>
                    <div className="space-y-3">
                      <div className="rounded-lg border p-4 border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/30 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="rounded-md bg-emerald-500/20 p-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">Este dispositivo</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Última actividad: Ahora</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-950/70 border-0">
                          Actual
                        </Badge>
                      </div>
                      <div className="rounded-lg border p-4 border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/30 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="rounded-md bg-blue-500/20 p-2">
                            <Smartphone className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              iPhone de {user.name.split(" ")[0]}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Última actividad: Hace 2 días</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700"
                          onClick={() => {
                            toast({
                              title: "Sesión cerrada",
                              description: "Has cerrado la sesión en tu iPhone correctamente.",
                            })
                          }}
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

          <TabsContent value="reports" className="space-y-6 mt-6">
            <Card className="overflow-hidden border-slate-200 dark:border-slate-800/60 shadow-md">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/80 pb-4">
                <CardTitle className="flex items-center text-xl">
                  <FileText className="h-5 w-5 mr-2 text-slate-700 dark:text-slate-300" />
                  Informes Financieros
                </CardTitle>
                <CardDescription>Accede a informes detallados sobre tus finanzas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <Tabs defaultValue="monthly" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-md">
                    <TabsTrigger
                      value="monthly"
                      className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm"
                    >
                      Mensual
                    </TabsTrigger>
                    <TabsTrigger
                      value="quarterly"
                      className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm"
                    >
                      Trimestral
                    </TabsTrigger>
                    <TabsTrigger
                      value="yearly"
                      className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm"
                    >
                      Anual
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="monthly" className="space-y-4 pt-4">
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <DownloadReportDialog type="expenses" />
                      <DownloadReportDialog type="income" />
                      <DownloadReportDialog type="savings" />
                      <DownloadReportDialog type="complete" />
                    </div>
                  </TabsContent>
                  <TabsContent value="quarterly" className="space-y-4 pt-4">
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <DownloadReportDialog type="quarterly" />
                      <DownloadReportDialog type="quarterly" />
                      <DownloadReportDialog type="quarterly" />
                      <DownloadReportDialog type="quarterly" />
                    </div>
                  </TabsContent>
                  <TabsContent value="yearly" className="space-y-4 pt-4">
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <DownloadReportDialog type="yearly" />
                      <DownloadReportDialog type="yearly" />
                      <DownloadReportDialog type="yearly" />
                      <DownloadReportDialog type="yearly" />
                    </div>
                  </TabsContent>
                </Tabs>
                <Button
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white"
                  onClick={() => {
                    toast({
                      title: "Informes descargados",
                      description: "Todos los informes han sido descargados correctamente.",
                    })
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar todos los informes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* Subscription Plans Modal */}
      <SubscriptionPlansModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        currentPlan={user.subscriptionPlan}
      />
    </div>
  )
}
