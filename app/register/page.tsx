"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LogoIcon } from "@/components/logo-icon"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle, AlertCircle, Camera, User, Lock, Mail, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import * as faceapi from "face-api.js"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingModels, setIsLoadingModels] = useState(true)
  const [isFaceDetected, setIsFaceDetected] = useState(false)
  const [isFaceRegistered, setIsFaceRegistered] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordFeedback, setPasswordFeedback] = useState("")
  const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(null)
  const [detectionInterval, setDetectionInterval] = useState<NodeJS.Timeout | null>(null)
  const [detectionCount, setDetectionCount] = useState(0)
  const [registrationProgress, setRegistrationProgress] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { register } = useAuth()

  // Password strength checker
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      setPasswordFeedback("")
      return
    }

    let strength = 0
    // Length check
    if (password.length >= 8) strength += 1
    // Contains number
    if (/\d/.test(password)) strength += 1
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1
    // Contains special char
    if (/[^A-Za-z0-9]/.test(password)) strength += 1

    setPasswordStrength(strength)

    // Feedback
    if (strength <= 2) {
      setPasswordFeedback("Débil")
    } else if (strength <= 4) {
      setPasswordFeedback("Medio")
    } else {
      setPasswordFeedback("Fuerte")
    }
  }, [password])

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoadingModels(true)

        // Use CDN URLs for models instead of local files
        const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models"

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ])

        console.log("Face detection models loaded successfully")
        setIsLoadingModels(false)
      } catch (error) {
        console.error("Error loading face detection models:", error)
        setIsLoadingModels(false)
        setCameraError("No se pudieron cargar los modelos de detección facial")
      }
    }

    loadModels()

    // Cleanup function
    return () => {
      if (isCameraActive) {
        stopCamera()
      }

      if (detectionInterval) {
        clearInterval(detectionInterval)
      }
    }
  }, [])

  const startCamera = async () => {
    // Only run in browser environment
    if (typeof window === "undefined") return

    // Reset states
    setIsCameraActive(false)
    setIsFaceDetected(false)
    setCameraError(null)
    setDetectionCount(0)
    setRegistrationProgress(0)

    // Clear any existing intervals
    if (detectionInterval) {
      clearInterval(detectionInterval)
      setDetectionInterval(null)
    }

    // Check if mediaDevices API is available
    if (!navigator || !navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
      console.error("Media Devices API not supported in this browser")
      setCameraError("Tu navegador no soporta acceso a la cámara")
      return
    }

    try {
      // Try to get camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
            detectFace()
          }
        }
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setCameraError("Acceso a la cámara denegado. Por favor, permite el acceso.")
      } else if (error instanceof DOMException && error.name === "NotFoundError") {
        setCameraError("No se detectó ninguna cámara en tu dispositivo")
      } else {
        setCameraError("Error al acceder a la cámara")
      }
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsCameraActive(false)
    }

    // Clear any detection intervals
    if (detectionInterval) {
      clearInterval(detectionInterval)
      setDetectionInterval(null)
    }
  }

  const detectFace = async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return

    try {
      // Use withFaceLandmarks and withFaceDescriptor for better recognition
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptors()

      // Draw detections
      const canvas = canvasRef.current
      const displaySize = { width: videoRef.current.width, height: videoRef.current.height }
      faceapi.matchDimensions(canvas, displaySize)

      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
      }

      // Update face detection state
      if (detections.length > 0) {
        // Get the face with the highest confidence score
        const bestMatch = detections.reduce((prev, current) =>
          prev.detection.score > current.detection.score ? prev : current,
        )

        setIsFaceDetected(true)

        // Store the face descriptor for later use
        if (bestMatch.descriptor) {
          setFaceDescriptor(bestMatch.descriptor)

          // Increment detection count for progress
          setDetectionCount((prev) => {
            const newCount = prev + 1
            // Calculate progress percentage (max 100%)
            const progress = Math.min(Math.floor((newCount / 30) * 100), 100)
            setRegistrationProgress(progress)
            return newCount
          })

          // After sufficient detections, consider it registered
          if (detectionCount >= 30) {
            registerFace(bestMatch.descriptor)
          }
        }
      } else {
        setIsFaceDetected(false)
        // Reset progress if face is lost
        if (detectionCount > 0 && detectionCount < 15) {
          setDetectionCount(0)
          setRegistrationProgress(0)
        }
      }

      // Continue detection if camera is still active
      if (isCameraActive && !isFaceRegistered) {
        requestAnimationFrame(detectFace)
      }
    } catch (error) {
      console.error("Error in face detection:", error)
      setCameraError("Error en la detección facial")
    }
  }

  const registerFace = (descriptor: Float32Array) => {
    try {
      // Store the face descriptor in localStorage
      // In a real app, you would send this to your backend
      const faceData = {
        userId: email, // Use email as identifier
        descriptor: Array.from(descriptor), // Convert to regular array for storage
        createdAt: new Date().toISOString(),
      }

      localStorage.setItem("faceAuthData", JSON.stringify(faceData))

      // Update state
      setIsFaceRegistered(true)
      stopCamera()

      toast({
        title: "Rostro registrado",
        description: "Tu rostro ha sido registrado correctamente para autenticación biométrica",
      })
    } catch (error) {
      console.error("Error registering face:", error)
      setCameraError("Error al registrar el rostro")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step < 3) {
      // Validate current step
      if (step === 1) {
        if (!name || !email) {
          toast({
            title: "Campos requeridos",
            description: "Por favor completa todos los campos",
            variant: "destructive",
          })
          return
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          toast({
            title: "Email inválido",
            description: "Por favor ingresa un email válido",
            variant: "destructive",
          })
          return
        }

        setStep(2)
        return
      }

      if (step === 2) {
        if (!password || !confirmPassword) {
          toast({
            title: "Campos requeridos",
            description: "Por favor completa todos los campos",
            variant: "destructive",
          })
          return
        }

        if (password !== confirmPassword) {
          toast({
            title: "Las contraseñas no coinciden",
            description: "Por favor verifica que las contraseñas sean iguales",
            variant: "destructive",
          })
          return
        }

        if (passwordStrength < 3) {
          toast({
            title: "Contraseña débil",
            description: "Por favor usa una contraseña más segura",
            variant: "destructive",
          })
          return
        }

        setStep(3)
        return
      }
    }

    // Final registration
    try {
      setIsLoading(true)

      // Create biometric data object
      const biometricData = faceDescriptor
        ? {
            hasFaceRegistration: true,
            faceDescriptor: Array.from(faceDescriptor),
          }
        : {
            hasFaceRegistration: false,
          }

      // Register user with biometric data
      await register(name, email, password, undefined, biometricData)

      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente",
      })

      // Redirect to login
      router.push("/login")
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Error de registro",
        description: "No se pudo completar el registro. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <div className="relative">
                  <Input
                    id="name"
                    placeholder="Ingresa tu nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ingresa tu correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" asChild>
                <Link href="/login">Volver</Link>
              </Button>
              <Button onClick={() => handleRegister(new Event("submit") as unknown as React.FormEvent)}>
                Continuar
              </Button>
            </div>
          </>
        )

      case 2:
        return (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Crea una contraseña segura"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                {password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            passwordStrength <= 2
                              ? "bg-red-500"
                              : passwordStrength <= 4
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm">{passwordFeedback}</span>
                    </div>
                    <ul className="text-xs text-gray-500 mt-2 space-y-1">
                      <li className={password.length >= 8 ? "text-green-500" : ""}>• Mínimo 8 caracteres</li>
                      <li className={/\d/.test(password) ? "text-green-500" : ""}>• Al menos un número</li>
                      <li className={/[A-Z]/.test(password) ? "text-green-500" : ""}>• Al menos una mayúscula</li>
                      <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-500" : ""}>
                        • Al menos un carácter especial
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirma tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                {password && confirmPassword && (
                  <div className="flex items-center gap-2 mt-2">
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-500">Las contraseñas coinciden</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-500">Las contraseñas no coinciden</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(1)}>
                Atrás
              </Button>
              <Button onClick={() => handleRegister(new Event("submit") as unknown as React.FormEvent)}>
                Continuar
              </Button>
            </div>
          </>
        )

      case 3:
        return (
          <>
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">
                  Para mayor seguridad, registra tu rostro para el inicio de sesión biométrico
                </p>
              </div>

              <div className="relative mx-auto w-full max-w-[320px] h-[240px] bg-gray-100 rounded-lg overflow-hidden">
                {isLoadingModels ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-sm text-gray-500">Cargando modelos de reconocimiento facial...</p>
                  </div>
                ) : cameraError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                    <p className="text-sm text-center text-gray-700">{cameraError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => {
                        setCameraError(null)
                        startCamera()
                      }}
                    >
                      Reintentar
                    </Button>
                  </div>
                ) : isFaceRegistered ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-50">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                    <p className="text-sm font-medium text-green-700">¡Rostro registrado con éxito!</p>
                  </div>
                ) : isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      width={320}
                      height={240}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} width={320} height={240} className="absolute inset-0 w-full h-full" />
                    <div
                      className="absolute inset-0 border-4 rounded-lg border-transparent transition-colors duration-300"
                      style={{ borderColor: isFaceDetected ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)" }}
                    />

                    {/* Add progress indicator */}
                    {isFaceDetected && registrationProgress > 0 && (
                      <div className="absolute bottom-10 left-4 right-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div
                            className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${registrationProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-center mt-1 font-medium">
                          {registrationProgress < 100
                            ? `Registrando rostro: ${registrationProgress}%`
                            : "Procesando..."}
                        </p>
                      </div>
                    )}

                    <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          isFaceDetected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {isFaceDetected ? "Rostro detectado" : "Posiciona tu rostro en el centro"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Camera className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-4">Cámara desactivada</p>
                    <Button variant="outline" size="sm" onClick={startCamera}>
                      Activar cámara
                    </Button>
                  </div>
                )}
              </div>

              <div className="text-center mt-4">
                <p className="text-xs text-gray-500">
                  {isFaceRegistered
                    ? "Tu rostro ha sido registrado y se utilizará para verificar tu identidad al iniciar sesión."
                    : "Posiciona tu rostro frente a la cámara y mantente quieto para completar el registro biométrico."}
                </p>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(2)}>
                Atrás
              </Button>
              <Button onClick={handleRegister} disabled={isLoading || (!isFaceRegistered && isCameraActive)}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : isFaceRegistered ? (
                  "Completar registro"
                ) : (
                  "Registrar sin biometría"
                )}
              </Button>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 mb-2">
            <LogoIcon />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Crear cuenta</CardTitle>
          <CardDescription className="text-center">Ingresa tus datos para registrarte en CleverPay</CardDescription>

          {/* Progress steps */}
          <div className="w-full flex items-center justify-between mt-4 px-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === i
                      ? "bg-primary text-white"
                      : step > i
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500 dark:bg-gray-700"
                  }`}
                >
                  {step > i ? <CheckCircle className="h-5 w-5" /> : i}
                </div>
                <span className="text-xs mt-1">{i === 1 ? "Datos" : i === 2 ? "Seguridad" : "Biometría"}</span>
              </div>
            ))}
          </div>
        </CardHeader>

        <form onSubmit={handleRegister}>
          <CardContent>{renderStep()}</CardContent>

          <CardFooter className="flex flex-col">
            <div className="text-center w-full mt-4 text-sm">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Iniciar sesión
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

