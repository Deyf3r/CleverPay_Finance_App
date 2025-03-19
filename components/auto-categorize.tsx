"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { categorizeTranasction } from "@/utils/ai-predictions"
import { TagIcon, CheckCircleIcon, AlertCircleIcon } from "lucide-react"
import { useSettings } from "@/context/settings-context"
import { Badge } from "@/components/ui/badge"

export default function AutoCategorize() {
  const { translate } = useSettings()
  const [description, setDescription] = useState("")
  const [result, setResult] = useState<{
    category: string
    confidence: number
    alternativeCategories: { category: string; confidence: number }[]
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCategorize = () => {
    if (!description.trim()) return

    setIsProcessing(true)

    // Simular un pequeño retraso para dar la sensación de procesamiento
    setTimeout(() => {
      const prediction = categorizeTranasction(description)
      setResult(prediction)
      setIsProcessing(false)
    }, 800)
  }

  const getCategoryLabel = (category: string) => {
    return translate(`category.${category}`)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return "text-emerald-500 dark:text-emerald-400"
    if (confidence >= 0.4) return "text-amber-500 dark:text-amber-400"
    return "text-rose-500 dark:text-rose-400"
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.7) return <CheckCircleIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
    if (confidence >= 0.4) return <AlertCircleIcon className="h-4 w-4 text-amber-500 dark:text-amber-400" />
    return <AlertCircleIcon className="h-4 w-4 text-rose-500 dark:text-rose-400" />
  }

  const getConfidenceText = (confidence: number) => {
    const percentage = Math.round(confidence * 100)
    if (confidence >= 0.7) return `${translate("ai.high_confidence")} (${percentage}%)`
    if (confidence >= 0.4) return `${translate("ai.medium_confidence")} (${percentage}%)`
    return `${translate("ai.low_confidence")} (${percentage}%)`
  }

  return (
    <Card className="card">
      <CardHeader>
        <CardTitle className="text-lg">{translate("ai.auto_categorize")}</CardTitle>
        <CardDescription>{translate("ai.suggest_category")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder={translate("ai.enter_description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCategorize()}
            />
          </div>

          {result && (
            <div className="space-y-4">
              <div className="flex items-start p-4 bg-primary/5 dark:bg-primary/20 rounded-md">
                <div className="mr-4 rounded-full bg-primary/10 dark:bg-primary/30 p-2 mt-1">
                  <TagIcon className="h-4 w-4 text-primary dark:text-primary-foreground" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-sm font-medium">{translate("ai.suggested_category")}</p>
                    <div className="flex items-center mt-1">
                      <p className="text-lg font-bold">{getCategoryLabel(result.category)}</p>
                      <Badge variant="outline" className="ml-2 flex items-center gap-1">
                        {getConfidenceIcon(result.confidence)}
                        <span className={`text-xs ${getConfidenceColor(result.confidence)}`}>
                          {getConfidenceText(result.confidence)}
                        </span>
                      </Badge>
                    </div>
                  </div>

                  {result.alternativeCategories.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{translate("ai.alternative_categories")}</p>
                      <div className="flex flex-wrap gap-2">
                        {result.alternativeCategories.map((alt, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {getCategoryLabel(alt.category)}
                            <span className="text-xs text-muted-foreground">({Math.round(alt.confidence * 100)}%)</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>{translate("ai.categorization_explanation")}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleCategorize} disabled={!description.trim() || isProcessing} className="w-full">
          {isProcessing ? (
            <>
              <span className="animate-pulse mr-2">●</span>
              {translate("ai.processing")}
            </>
          ) : (
            translate("ai.categorize")
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

