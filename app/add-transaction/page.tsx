"use client"

import { useState } from "react"
import { NavBar } from "@/components/nav-bar"
import { EnhancedTransactionForm } from "@/components/enhanced-transaction-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PredictionInsights } from "@/components/prediction-insights"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export default function AddTransactionPage() {
  const [activeTab, setActiveTab] = useState("form")

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <NavBar />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-8 px-4"
      >
        <Tabs defaultValue="form" className="w-full" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">
              {activeTab === "form" ? "Nueva Transacción" : "Predicciones Inteligentes"}
            </h1>
            <TabsList className="grid grid-cols-2 w-[400px]">
              <TabsTrigger
                value="form"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Formulario
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Predicciones IA
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="form" className="mt-0">
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-muted/50 rounded-t-lg">
                <CardTitle>Detalles de la Transacción</CardTitle>
                <CardDescription>Ingresa los detalles de tu nueva transacción financiera</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <EnhancedTransactionForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="mt-0">
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-muted/50 rounded-t-lg">
                <CardTitle>Predicciones Inteligentes</CardTitle>
                <CardDescription>
                  Análisis predictivo basado en tus patrones de gasto y tendencias financieras
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <PredictionInsights />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
