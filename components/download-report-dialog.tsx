"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FileText, Download, FileSpreadsheet, FileIcon as FilePdf, FileJson, Wallet } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface DownloadReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ReportType = "transactions" | "budget" | "taxes" | "investments"
type ReportFormat = "pdf" | "csv" | "excel" | "json"

export function DownloadReportDialog({ open, onOpenChange }: DownloadReportDialogProps) {
  const [reportType, setReportType] = useState<ReportType>("transactions")
  const [reportFormat, setReportFormat] = useState<ReportFormat>("pdf")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDownload = async () => {
    setIsLoading(true)

    // Simulate download
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Informe descargado",
      description: `Tu informe de ${getReportName(reportType)} ha sido descargado en formato ${reportFormat.toUpperCase()}`,
    })

    setIsLoading(false)
    onOpenChange(false)
  }

  const getReportName = (type: ReportType): string => {
    switch (type) {
      case "transactions":
        return "transacciones"
      case "budget":
        return "presupuesto"
      case "taxes":
        return "impuestos"
      case "investments":
        return "inversiones"
    }
  }

  const getReportIcon = (type: ReportType) => {
    switch (type) {
      case "transactions":
        return <FileText className="h-4 w-4" />
      case "budget":
        return <Wallet className="h-4 w-4" />
      case "taxes":
        return <FileText className="h-4 w-4" />
      case "investments":
        return <Wallet className="h-4 w-4" />
    }
  }

  const getFormatIcon = (format: ReportFormat) => {
    switch (format) {
      case "pdf":
        return <FilePdf className="h-4 w-4" />
      case "csv":
        return <FileText className="h-4 w-4" />
      case "excel":
        return <FileSpreadsheet className="h-4 w-4" />
      case "json":
        return <FileJson className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Descargar informe</DialogTitle>
          <DialogDescription>Selecciona el tipo de informe y el formato que deseas descargar</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <Label>Tipo de informe</Label>
            <RadioGroup
              value={reportType}
              onValueChange={(value) => setReportType(value as ReportType)}
              className="grid gap-3"
            >
              <Label className="flex items-center space-x-3 space-y-0 border rounded-md p-3 cursor-pointer">
                <RadioGroupItem value="transactions" />
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Informe de transacciones</span>
                </div>
              </Label>
              <Label className="flex items-center space-x-3 space-y-0 border rounded-md p-3 cursor-pointer">
                <RadioGroupItem value="budget" />
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  <span>Informe de presupuesto</span>
                </div>
              </Label>
              <Label className="flex items-center space-x-3 space-y-0 border rounded-md p-3 cursor-pointer">
                <RadioGroupItem value="taxes" />
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Informe para impuestos</span>
                </div>
              </Label>
              <Label className="flex items-center space-x-3 space-y-0 border rounded-md p-3 cursor-pointer">
                <RadioGroupItem value="investments" />
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  <span>Informe de inversiones</span>
                </div>
              </Label>
            </RadioGroup>
          </div>
          <div className="space-y-4">
            <Label>Formato</Label>
            <RadioGroup
              value={reportFormat}
              onValueChange={(value) => setReportFormat(value as ReportFormat)}
              className="grid grid-cols-2 gap-3"
            >
              <Label className="flex items-center space-x-3 space-y-0 border rounded-md p-3 cursor-pointer">
                <RadioGroupItem value="pdf" />
                <div className="flex items-center gap-2">
                  <FilePdf className="h-4 w-4" />
                  <span>PDF</span>
                </div>
              </Label>
              <Label className="flex items-center space-x-3 space-y-0 border rounded-md p-3 cursor-pointer">
                <RadioGroupItem value="csv" />
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>CSV</span>
                </div>
              </Label>
              <Label className="flex items-center space-x-3 space-y-0 border rounded-md p-3 cursor-pointer">
                <RadioGroupItem value="excel" />
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Excel</span>
                </div>
              </Label>
              <Label className="flex items-center space-x-3 space-y-0 border rounded-md p-3 cursor-pointer">
                <RadioGroupItem value="json" />
                <div className="flex items-center gap-2">
                  <FileJson className="h-4 w-4" />
                  <span>JSON</span>
                </div>
              </Label>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleDownload} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              "Descargando..."
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

