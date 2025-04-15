"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Download, FileText, Loader2 } from "lucide-react"
import { useSettings } from "@/context/settings-context"
import { toast } from "@/components/ui/use-toast"

export function ExportPDF() {
  const { translate } = useSettings()
  const [isExporting, setIsExporting] = useState(false)
  const [sections, setSections] = useState({
    transactions: true,
    accounts: true,
    aiInsights: true,
    dashboard: true,
  })

  const handleExport = async () => {
    setIsExporting(true)

    // Simular un tiempo de procesamiento
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // En una implementación real, aquí se generaría el PDF con una biblioteca como jsPDF o react-to-pdf

    setIsExporting(false)
    toast({
      title: translate("export.success"),
      description: translate("export.file_ready"),
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20">
          <FileText className="h-4 w-4" />
          {translate("export.export_pdf")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md dark:bg-card dark:border-border/20">
        <DialogHeader>
          <DialogTitle>{translate("export.export_summary")}</DialogTitle>
          <DialogDescription>{translate("export.select_sections")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="transactions"
              checked={sections.transactions}
              onCheckedChange={(checked) => setSections({ ...sections, transactions: checked === true })}
              className="dark:border-border/50 dark:data-[state=checked]:bg-primary dark:data-[state=checked]:border-primary"
            />
            <Label htmlFor="transactions">{translate("export.transactions_section")}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="accounts"
              checked={sections.accounts}
              onCheckedChange={(checked) => setSections({ ...sections, accounts: checked === true })}
              className="dark:border-border/50 dark:data-[state=checked]:bg-primary dark:data-[state=checked]:border-primary"
            />
            <Label htmlFor="accounts">{translate("export.accounts_section")}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="aiInsights"
              checked={sections.aiInsights}
              onCheckedChange={(checked) => setSections({ ...sections, aiInsights: checked === true })}
              className="dark:border-border/50 dark:data-[state=checked]:bg-primary dark:data-[state=checked]:border-primary"
            />
            <Label htmlFor="aiInsights">{translate("export.ai_insights_section")}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dashboard"
              checked={sections.dashboard}
              onCheckedChange={(checked) => setSections({ ...sections, dashboard: checked === true })}
              className="dark:border-border/50 dark:data-[state=checked]:bg-primary dark:data-[state=checked]:border-primary"
            />
            <Label htmlFor="dashboard">{translate("export.dashboard_section")}</Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {translate("export.generating")}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                {translate("export.download")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
