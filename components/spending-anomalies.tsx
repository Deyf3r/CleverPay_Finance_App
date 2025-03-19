"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangleIcon, InfoIcon } from "lucide-react"
import { useSettings } from "@/context/settings-context"
import { Progress } from "@/components/ui/progress"

interface AnomalyProps {
  anomalies: {
    category: string
    amount: number
    percentageIncrease: number
    averageAmount: number
    description: string
  }[]
}

export default function SpendingAnomalies({ anomalies }: AnomalyProps) {
  const { formatCurrency, translate } = useSettings()

  if (anomalies.length === 0) {
    return (
      <Card className="card">
        <CardHeader>
          <CardTitle className="text-lg">{translate("ai.spending_anomalies")}</CardTitle>
          <CardDescription>{translate("ai.unusual_patterns")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <div className="rounded-full bg-primary/10 p-3 mb-3">
              <AlertTriangleIcon className="h-6 w-6 text-primary" />
            </div>
            <p>{translate("ai.no_anomalies")}</p>
            <p className="text-sm mt-1">{translate("ai.consistent_patterns")}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getCategoryLabel = (category: string) => {
    return translate(`category.${category}`)
  }

  return (
    <Card className="card">
      <CardHeader>
        <CardTitle className="text-lg">{translate("ai.spending_anomalies")}</CardTitle>
        <CardDescription>{translate("ai.unusual_patterns")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {anomalies.map((anomaly, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-rose-100 dark:bg-rose-900 p-2">
                  <AlertTriangleIcon className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{getCategoryLabel(anomaly.category)}</p>
                  <p className="text-xs text-muted-foreground">
                    {anomaly.percentageIncrease.toFixed(0)}% {translate("ai.increase_from_last")}
                  </p>
                </div>
                <div className="font-medium text-rose-500 dark:text-rose-400">{formatCurrency(anomaly.amount)}</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{translate("ai.average_spending")}</span>
                  <span className="font-medium">{formatCurrency(anomaly.averageAmount)}</span>
                </div>
                <Progress
                  value={Math.min(100, (anomaly.averageAmount / anomaly.amount) * 100)}
                  className="h-1.5 bg-muted"
                />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{translate("ai.current_spending")}</span>
                  <span className="font-medium">{formatCurrency(anomaly.amount)}</span>
                </div>
              </div>

              <div className="flex items-start text-xs mt-2">
                <InfoIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">{anomaly.description}</p>
              </div>

              {index < anomalies.length - 1 && <div className="border-t border-border my-3"></div>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

