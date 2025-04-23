"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "lucide-react"
import { FeatureGate } from "./feature-gate"
import { useAuth } from "@/context/auth-context"

export function AdvancedAnalytics() {
  const [activeTab, setActiveTab] = useState("overview")
  const { user } = useAuth()

  return (
    <FeatureGate feature="advanced_analytics">
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800/60 shadow-md">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/80 pb-4">
          <CardTitle className="flex items-center text-xl">
            <BarChart className="h-5 w-5 mr-2 text-slate-700 dark:text-slate-300" />
            Análisis Avanzado
          </CardTitle>
          <CardDescription>Visualiza y analiza tus finanzas en detalle</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-slate-200 dark:border-slate-700/50">
              <TabsList className="bg-transparent h-auto p-0">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 dark:data-[state=active]:border-blue-400 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-none"
                >
                  <BarChart className="h-4 w-4 mr-2" />
                  Resumen
                </TabsTrigger>
                <TabsTrigger
                  value="trends"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 dark:data-[state=active]:border-blue-400 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-none"
                >
                  <LineChart className="h-4 w-4 mr-2" />
                  Tendencias
                </TabsTrigger>
                <TabsTrigger
                  value="categories"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 dark:data-[state=active]:border-blue-400 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-none"
                >
                  <PieChart className="h-4 w-4 mr-2" />
                  Categorías
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="overview" className="p-4">
              <div className="h-[300px] flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/30 rounded-md">
                <div className="text-center">
                  <BarChart className="h-12 w-12 mx-auto mb-3 text-slate-400 dark:text-slate-600" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Resumen de Gastos e Ingresos
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Visualiza tus gastos e ingresos por mes, categoría o cuenta.
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="trends" className="p-4">
              <div className="h-[300px] flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/30 rounded-md">
                <div className="text-center">
                  <LineChart className="h-12 w-12 mx-auto mb-3 text-slate-400 dark:text-slate-600" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Tendencias Financieras</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Analiza cómo evolucionan tus finanzas a lo largo del tiempo.
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="categories" className="p-4">
              <div className="h-[300px] flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/30 rounded-md">
                <div className="text-center">
                  <PieChart className="h-12 w-12 mx-auto mb-3 text-slate-400 dark:text-slate-600" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Distribución por Categorías
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Visualiza cómo se distribuyen tus gastos entre diferentes categorías.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </FeatureGate>
  )
}
