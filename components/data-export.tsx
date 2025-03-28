"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Download, FileDown, Loader2 } from "lucide-react"
import { FeatureGate } from "./feature-gate"
import { useToast } from "@/components/ui/use-toast"

export function DataExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState("csv")
  const [dateRange, setDateRange] = useState("all")
  const [includeCategories, setIncludeCategories] = useState(true)
  const [includeNotes, setIncludeNotes] = useState(true)
  const { toast } = useToast()

  const handleExport = () => {
    setIsExporting(true)

    // Simulamos la exportación
    setTimeout(() => {
      setIsExporting(false)

      toast({
        title: "Datos exportados",
        description: `Tus datos han sido exportados en formato ${exportFormat.toUpperCase()}.`,
      })
    }, 2000)
  }

  return (
    <FeatureGate feature="data_export">
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800/60 shadow-md">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/80 pb-4">
          <CardTitle className="flex items-center text-xl">
            <Download className="h-5 w-5 mr-2 text-slate-700 dark:text-slate-300" />
            Exportar Datos
          </CardTitle>
          <CardDescription>Exporta tus datos financieros en diferentes formatos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="export-format">Formato de exportación</Label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger
                id="export-format"
                className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              >
                <SelectValue placeholder="Selecciona un formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-range">Rango de fechas</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger
                id="date-range"
                className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              >
                <SelectValue placeholder="Selecciona un rango" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los datos</SelectItem>
                <SelectItem value="this-month">Este mes</SelectItem>
                <SelectItem value="last-month">Mes pasado</SelectItem>
                <SelectItem value="this-year">Este año</SelectItem>
                <SelectItem value="last-year">Año pasado</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-categories"
                checked={includeCategories}
                onCheckedChange={(checked) => setIncludeCategories(checked as boolean)}
              />
              <Label htmlFor="include-categories" className="text-sm">
                Incluir categorías
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-notes"
                checked={includeNotes}
                onCheckedChange={(checked) => setIncludeNotes(checked as boolean)}
              />
              <Label htmlFor="include-notes" className="text-sm">
                Incluir notas
              </Label>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar datos
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </FeatureGate>
  )
}

