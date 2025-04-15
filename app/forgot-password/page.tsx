"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CleverPayLogo } from "@/components/cleverpay-logo"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { resetPassword } = useAuth()

  const validateForm = () => {
    if (!email.trim()) {
      setError("Por favor, ingresa tu correo electrónico.")
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido.")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const result = await resetPassword(email)

      if (result.success) {
        setSuccess(
          result.message || "Te hemos enviado un correo electrónico con instrucciones para restablecer tu contraseña.",
        )
        setEmail("")
      } else {
        setError(result.message || "Error al enviar el correo. Por favor, inténtalo de nuevo.")
      }
    } catch (error) {
      setError("Ocurrió un error inesperado. Por favor, inténtalo de nuevo.")
      console.error("Password reset failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center auth-background p-4">
      <Card className="w-full max-w-md glass-card shine-effect">
        <CardHeader className="space-y-1">
          <div className="flex flex-col items-center space-y-2 mb-6">
            <CleverPayLogo size="lg" centered />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Recuperar contraseña</CardTitle>
          <CardDescription className="text-center">
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="premium-input"
              />
            </div>
            <Button type="submit" className="w-full premium-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar instrucciones"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">¿Recordaste tu contraseña? </span>
            <Link href="/login" className="text-primary hover:underline">
              Volver al inicio de sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
