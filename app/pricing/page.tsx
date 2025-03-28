"use client"

import { useAuth } from "@/context/auth-context"
import { PricingCard } from "@/components/pricing-card"
import NavBar from "@/components/nav-bar"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "month",
    features: [
      "Gestión básica de transacciones",
      "Seguimiento de gastos",
      "Hasta 50 transacciones por mes",
      "Soporte por email",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 9.99,
    period: "month",
    featured: true,
    features: [
      "Hasta 1000 transacciones",
      "Categorización automática",
      "Exportación de informes",
      "Soporte prioritario",
      "Todo lo incluido en Free",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 19.99,
    period: "month",
    features: [
      "Transacciones ilimitadas",
      "Análisis avanzado de finanzas",
      "Predicciones con IA",
      "Múltiples cuentas",
      "Soporte 24/7",
      "Todo lo incluido en Pro",
    ],
  },
]

export default function PricingPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <NavBar />
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 px-4 py-8 sm:py-16">
        <div className="text-center space-y-4">
          <Button
            variant="ghost"
            className="mb-4 text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>

          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent px-4">
            Planes simples para finanzas inteligentes
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto px-4">
            Elige el plan que mejor se adapte a tus necesidades y comienza a gestionar tus finanzas de manera más
            inteligente.
          </p>

          {user && (
            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg inline-block border border-slate-700 mx-auto max-w-full">
              <p className="text-slate-300">
                Plan actual: <span className="font-bold text-emerald-400">{user.planType || "Free"}</span>
              </p>
              <Button
                variant="link"
                className="text-sky-400 hover:text-sky-300"
                onClick={() => router.push("/profile")}
              >
                Gestionar suscripción en tu perfil
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {plans.map((plan) => (
            <PricingCard key={plan.id} {...plan} currentPlan={user?.planType || "free"} />
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-12 text-slate-400 max-w-2xl mx-auto px-4">
          <p>
            Todos los planes incluyen nuestra aplicación móvil, sincronización en la nube y actualizaciones regulares.
            ¿Tienes preguntas?{" "}
            <a href="#" className="text-sky-400 hover:underline">
              Contáctanos
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

