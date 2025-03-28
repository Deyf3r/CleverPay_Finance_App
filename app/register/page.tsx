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
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Camera,
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  RefreshCw,
  ThumbsUp,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import * as faceapi from "face-api.js"

// Añadir importación para el componente de transición
import { motion, AnimatePresence } from "framer-motion"

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
  const [detectionCount, setDetectionCount] = useState(0)
  const [registrationProgress, setRegistrationProgress] = useState(0)
  const [faceDetectionMessage, setFaceDetectionMessage] = useState("Posiciona tu rostro en el centro")
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [faceReadyForRegistration, setFaceReadyForRegistration] = useState(false)
  const [capturedImageData, setCapturedImageData] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  const modelsLoadedRef = useRef<boolean>(false)
  const lastDescriptorRef = useRef<Float32Array | null>(null)

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
        setDebugInfo("Iniciando carga de modelos...")

        // Usar CDN más confiable para los modelos
        const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model"

        // Cargar modelos en paralelo
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ])

        modelsLoadedRef.current = true
        setDebugInfo("Modelos cargados correctamente")
        setIsLoadingModels(false)
      } catch (error) {
        console.error("Error loading face detection models:", error)
        setDebugInfo(`Error al cargar modelos: ${error instanceof Error ? error.message : String(error)}`)
        setIsLoadingModels(false)
        setCameraError("No se pudieron cargar los modelos de detección facial. Intenta recargar la página.")
      }
    }

    loadModels()

    // Cleanup function
    return () => {
      stopCamera()
    }
  }, [])

  // Auto-start camera when reaching step 3
  useEffect(() => {
    if (step === 3 && !isCameraActive && !isLoadingModels && !isFaceRegistered && !faceReadyForRegistration) {
      startCamera()
    }
  }, [step, isCameraActive, isLoadingModels, isFaceRegistered, faceReadyForRegistration])

  const startCamera = async () => {
    // Only run in browser environment
    if (typeof window === "undefined") return

    // Reset states
    setIsCameraActive(false)
    setIsFaceDetected(false)
    setCameraError(null)
    setDetectionCount(0)
    setRegistrationProgress(0)
    setFaceDetectionMessage("Iniciando cámara...")
    setDebugInfo("Solicitando acceso a la cámara...")
    setFaceReadyForRegistration(false)
    setCapturedImageData(null)

    // Stop any existing stream
    stopCamera()

    // Check if mediaDevices API is available
    if (!navigator || !navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
      console.error("Media Devices API not supported in this browser")
      setDebugInfo("API de MediaDevices no soportada")
      setCameraError("Tu navegador no soporta acceso a la cámara. Intenta con Chrome o Firefox.")
      return
    }

    try {
      // Try to get camera access with optimal settings
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
          frameRate: { ideal: 30 },
        },
        audio: false,
      })

      setDebugInfo("Acceso a cámara concedido, configurando video...")

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream

        // Ensure video dimensions are set correctly
        videoRef.current.width = 320
        videoRef.current.height = 240

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                setIsCameraActive(true)
                setFaceDetectionMessage("Posiciona tu rostro en el centro")
                setDebugInfo("Video iniciado, comenzando detección facial...")

                // Ensure canvas dimensions match video
                if (canvasRef.current) {
                  canvasRef.current.width = videoRef.current.width
                  canvasRef.current.height = videoRef.current.height
                }

                // Start face detection loop
                startFaceDetection()
              })
              .catch((err) => {
                console.error("Error playing video:", err)
                setDebugInfo(`Error al reproducir video: ${err.message}`)
                setCameraError("Error al iniciar la reproducción de video. Intenta recargar la página.")
              })
          }
        }

        // Handle video errors
        videoRef.current.onerror = (e) => {
          console.error("Video error:", e)
          setDebugInfo(`Error de video: ${e.type}`)
          setCameraError("Error con el elemento de video. Intenta recargar la página.")
        }
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setDebugInfo(`Error de acceso a cámara: ${error instanceof Error ? error.message : String(error)}`)

      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setCameraError("Acceso a la cámara denegado. Por favor, permite el acceso en la configuración de tu navegador.")
      } else if (error instanceof DOMException && error.name === "NotFoundError") {
        setCameraError("No se detectó ninguna cámara en tu dispositivo. Conecta una cámara e intenta de nuevo.")
      } else if (error instanceof DOMException && error.name === "NotReadableError") {
        setCameraError(
          "La cámara está siendo utilizada por otra aplicación. Cierra otras aplicaciones que puedan estar usando la cámara.",
        )
      } else {
        setCameraError(`Error al acceder a la cámara: ${error instanceof Error ? error.message : "Error desconocido"}`)
      }
    }
  }

  const stopCamera = () => {
    // Stop animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
      streamRef.current = null
    }

    // Clear video source
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null
    }

    setIsCameraActive(false)
    setDebugInfo("Cámara detenida")
  }

  const captureCurrentFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return null

    // Capturar el frame actual del video
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

    // Convertir a imagen base64
    return canvas.toDataURL("image/jpeg", 0.8)
  }

  const startFaceDetection = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) {
      setDebugInfo("No se puede iniciar detección: video o canvas no disponible")
      return
    }

    if (!modelsLoadedRef.current) {
      setDebugInfo("No se puede iniciar detección: modelos no cargados")
      setCameraError("Los modelos de detección facial no están cargados. Intenta recargar la página.")
      return
    }

    setDebugInfo("Iniciando bucle de detección facial...")

    const detectFace = async () => {
      if (!videoRef.current || !canvasRef.current || !isCameraActive || faceReadyForRegistration) {
        return
      }

      try {
        // Make sure video is ready and playing
        if (videoRef.current.readyState !== 4 || videoRef.current.paused || videoRef.current.ended) {
          setDebugInfo(`Video no listo: readyState=${videoRef.current.readyState}, paused=${videoRef.current.paused}`)
          animationRef.current = requestAnimationFrame(detectFace)
          return
        }

        // Detect faces with optimized settings
        const detectionOptions = new faceapi.TinyFaceDetectorOptions({
          inputSize: 320, // Balance between speed and accuracy
          scoreThreshold: 0.5,
        })

        const detections = await faceapi
          .detectAllFaces(videoRef.current, detectionOptions)
          .withFaceLandmarks()
          .withFaceDescriptors()

        // Draw results
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d", { willReadFrequently: true })

        if (!ctx) {
          setDebugInfo("No se pudo obtener contexto 2D del canvas")
          animationRef.current = requestAnimationFrame(detectFace)
          return
        }

        // Get display size
        const displaySize = {
          width: videoRef.current.width,
          height: videoRef.current.height,
        }

        // Match dimensions
        faceapi.matchDimensions(canvas, displaySize)

        // Resize detections to match display size
        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        // Clear previous drawings
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // First draw video frame to canvas for better visualization
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

        // Draw guide oval
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const ovalWidth = 180
        const ovalHeight = 220

        ctx.beginPath()
        ctx.ellipse(centerX, centerY, ovalWidth / 2, ovalHeight / 2, 0, 0, 2 * Math.PI)
        ctx.strokeStyle = isFaceDetected ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.5)"
        ctx.lineWidth = 3
        ctx.stroke()

        // Process face detection results
        if (resizedDetections.length > 0) {
          // Get the face with highest confidence
          const bestMatch = resizedDetections.reduce((prev, current) =>
            prev.detection.score > current.detection.score ? prev : current,
          )

          // Get face position data
          const box = bestMatch.detection.box
          const centerFaceX = box.x + box.width / 2
          const centerFaceY = box.y + box.height / 2
          const canvasCenterX = canvas.width / 2
          const canvasCenterY = canvas.height / 2

          // Calculate distance from center and face size ratio
          const distanceFromCenter = Math.sqrt(
            Math.pow(centerFaceX - canvasCenterX, 2) + Math.pow(centerFaceY - canvasCenterY, 2),
          )

          const idealFaceWidth = canvas.width * 0.4
          const faceToIdealRatio = box.width / idealFaceWidth

          // Check if face is well positioned
          const isWellPositioned =
            distanceFromCenter < 50 && // Close to center
            faceToIdealRatio > 0.7 && // Not too small
            faceToIdealRatio < 1.3 && // Not too large
            bestMatch.detection.score > 0.7 // High confidence

          // Update face detection state
          setIsFaceDetected(isWellPositioned)

          // Draw face detection with appropriate color
          if (isWellPositioned) {
            // Green box for well-positioned face
            ctx.strokeStyle = "rgba(34, 197, 94, 0.8)"
            ctx.lineWidth = 2
            ctx.strokeRect(box.x, box.y, box.width, box.height)

            // Draw landmarks for better visual feedback
            bestMatch.landmarks.positions.forEach((point) => {
              ctx.beginPath()
              ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI)
              ctx.fillStyle = "rgba(34, 197, 94, 0.8)"
              ctx.fill()
            })

            // Store face descriptor for later registration
            if (bestMatch.descriptor) {
              lastDescriptorRef.current = bestMatch.descriptor

              // Increment detection count for progress
              setDetectionCount((prev) => {
                const newCount = prev + 1
                // Calculate progress percentage (max 100%)
                const progress = Math.min(Math.floor((newCount / 30) * 100), 100)
                setRegistrationProgress(progress)

                // Update detection message
                if (newCount < 10) {
                  setFaceDetectionMessage("Rostro detectado. Mantén la posición...")
                } else if (newCount < 20) {
                  setFaceDetectionMessage("Casi listo. Sigue así...")
                } else if (newCount < 30) {
                  setFaceDetectionMessage("Procesando datos biométricos...")
                }

                // After sufficient detections, prepare for registration but wait for user confirmation
                if (newCount >= 30 && !faceReadyForRegistration) {
                  prepareForRegistration(bestMatch.descriptor)
                }

                return newCount
              })
            }
          } else {
            // Yellow box for detected but not well-positioned face
            ctx.strokeStyle = "rgba(234, 179, 8, 0.8)"
            ctx.lineWidth = 2
            ctx.strokeRect(box.x, box.y, box.width, box.height)

            // Provide specific positioning guidance
            if (distanceFromCenter > 50) {
              setFaceDetectionMessage("Centra tu rostro en el óvalo")
            } else if (faceToIdealRatio < 0.7) {
              setFaceDetectionMessage("Acércate más a la cámara")
            } else if (faceToIdealRatio > 1.3) {
              setFaceDetectionMessage("Aléjate un poco de la cámara")
            } else {
              setFaceDetectionMessage("Ajusta la posición de tu rostro")
            }
          }

          setDebugInfo(
            `Rostro detectado: score=${bestMatch.detection.score.toFixed(2)}, distancia=${distanceFromCenter.toFixed(0)}, ratio=${faceToIdealRatio.toFixed(2)}`,
          )
        } else {
          // No face detected
          setIsFaceDetected(false)
          setFaceDetectionMessage("No se detecta ningún rostro")
          setDebugInfo("No se detectó ningún rostro")

          // Reset progress if face is lost for too long
          if (detectionCount > 0 && detectionCount < 15) {
            setDetectionCount(0)
            setRegistrationProgress(0)
          }
        }

        // Continue detection loop if camera is still active and not ready for registration
        if (isCameraActive && !faceReadyForRegistration) {
          animationRef.current = requestAnimationFrame(detectFace)
        }
      } catch (error) {
        console.error("Error in face detection:", error)
        setDebugInfo(`Error en detección facial: ${error instanceof Error ? error.message : String(error)}`)

        // Continue detection despite errors
        if (isCameraActive && !faceReadyForRegistration) {
          animationRef.current = requestAnimationFrame(detectFace)
        }
      }
    }

    // Start detection loop
    animationRef.current = requestAnimationFrame(detectFace)
  }

  const prepareForRegistration = (descriptor: Float32Array) => {
    // Pause the detection loop
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    // Capture the current frame
    const imageData = captureCurrentFrame()
    setCapturedImageData(imageData)

    // Store the descriptor
    setFaceDescriptor(descriptor)

    // Update state to show confirmation button
    setFaceReadyForRegistration(true)
    setFaceDetectionMessage("¡Rostro capturado! Presiona el botón para confirmar el registro.")
    setDebugInfo("Rostro listo para registro, esperando confirmación del usuario")
  }

  const confirmFaceRegistration = () => {
    if (!faceDescriptor) {
      setDebugInfo("Error: No hay descriptor facial para registrar")
      return
    }

    try {
      setDebugInfo("Registrando datos biométricos...")

      // Store the face descriptor securely
      // In a real app, you would send this to your backend
      const faceData = {
        userId: email, // Use email as identifier
        descriptor: Array.from(faceDescriptor), // Convert to regular array for storage
        createdAt: new Date().toISOString(),
        // Add hash for verification (in production you'd use something more secure)
        verificationHash: btoa(email + new Date().toISOString()).slice(0, 20),
      }

      localStorage.setItem("faceAuthData", JSON.stringify(faceData))

      // Update state
      setIsFaceRegistered(true)
      setFaceDetectionMessage("¡Registro biométrico completado!")
      setDebugInfo("Registro biométrico completado con éxito")

      // Stop camera after successful registration
      stopCamera()

      // Show success notification
      toast({
        title: "Rostro registrado con éxito",
        description: "Tu rostro ha sido registrado correctamente para autenticación biométrica",
        variant: "default",
      })
    } catch (error) {
      console.error("Error registering face:", error)
      setDebugInfo(`Error al registrar rostro: ${error instanceof Error ? error.message : String(error)}`)
      setCameraError("Error al registrar el rostro. Por favor, inténtalo de nuevo.")

      // Reset states to try again
      setFaceReadyForRegistration(false)
      startCamera()
    }
  }

  const cancelFaceRegistration = () => {
    // Reset states
    setFaceReadyForRegistration(false)
    setDetectionCount(0)
    setRegistrationProgress(0)
    setCapturedImageData(null)

    // Restart camera and detection
    startCamera()
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
      setDebugInfo("Iniciando registro de usuario...")

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
      setDebugInfo("Usuario registrado correctamente")

      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente",
      })

      // Redirect to login
      router.push("/login")
    } catch (error) {
      console.error("Registration error:", error)
      setDebugInfo(`Error en registro: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Error de registro",
        description: "No se pudo completar el registro. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Reemplazar la función renderStep con esta versión mejorada que incluye animaciones
  const renderStep = () => {
    const variants = {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {step === 1 && (
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
          )}

          {step === 2 && (
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
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                      className="mt-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${
                              passwordStrength <= 2
                                ? "bg-red-500"
                                : passwordStrength <= 4
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                            transition={{ duration: 0.5 }}
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
                    </motion.div>
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
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-2 mt-2"
                    >
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
                    </motion.div>
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
          )}

          {step === 3 && (
            <>
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-500">
                    Para mayor seguridad, registra tu rostro para el inicio de sesión biométrico
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative mx-auto w-full max-w-[320px] h-[240px] bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden shadow-lg"
                >
                  {isLoadingModels ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center"
                    >
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-8 w-8 rounded-full bg-primary/20"></div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">Cargando modelos de reconocimiento...</p>
                    </motion.div>
                  ) : cameraError ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/20"
                    >
                      <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                      <p className="text-sm text-center text-gray-700 dark:text-gray-200">{cameraError}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 bg-white dark:bg-gray-800"
                        onClick={() => {
                          setCameraError(null)
                          startCamera()
                        }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" /> Reintentar
                    </motion.div>
                  ) : isFaceRegistered ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="rounded-full bg-green-100 dark:bg-green-900/50 p-3 mb-2"
                      >
                        <CheckCircle className="h-10 w-10 text-green-500" />
                      </motion.div>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm font-medium text-green-700 dark:text-green-400"
                      >
                        ¡Rostro registrado con éxito!
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-xs text-green-600 dark:text-green-500 mt-1"
                      >
                        Podrás usar tu rostro para iniciar sesión
                      </motion.p>
                    </motion.div>
                  ) : faceReadyForRegistration ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center"
                    >
                      {capturedImageData ? (
                        <img
                          src={capturedImageData || "/placeholder.svg"}
                          alt="Rostro capturado"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="bg-gray-200 dark:bg-gray-700 w-full h-full"></div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center p-4"
                      >
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-[90%] text-center"
                        >
                          <ThumbsUp className="h-10 w-10 text-green-500 mx-auto mb-2" />
                          <h3 className="text-sm font-medium mb-2">¡Rostro capturado correctamente!</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            Presiona el botón para confirmar el registro biométrico
                          </p>
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelFaceRegistration}
                            >
                              Volver a intentar
                            </Button>
                            <Button
                              size="sm"
                              onClick={confirmFaceRegistration}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              Confirmar registro
                            </Button>
                          </div>
                        </motion.div>
                      </motion.div>
                    </motion.div>
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

                      {/* Overlay con instrucciones */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="absolute top-2 left-0 right-0 flex justify-center"
                      >
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-black/50 text-white backdrop-blur-sm">
                          {isFaceDetected ? "Mantén la posición" : "Centra tu rostro en el óvalo"}
                        </span>
                      </motion.div>

                      {/* Indicador de progreso */}
                      <AnimatePresence>
                        {isFaceDetected && registrationProgress > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-8 left-4 right-4"
                          >
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${registrationProgress}%` }}
                                className="bg-gradient-to-r from-blue-500 to-primary h-2.5 rounded-full transition-all duration-300"
                              />
                            </div>
                            <p className="text-xs text-center mt-1 font-medium text-white text-shadow">
                              {registrationProgress < 100
                                ? `Analizando: ${registrationProgress}%`
                                : "Procesando..."}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Indicador de estado */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="absolute bottom-2 left-0 right-0 flex justify-center"
                      >
                        <motion.span
                          animate={{
                            backgroundColor: isFaceDetected ? "rgb(34, 197, 94)" : "rgb(234, 179, 8)",
                          }}
                          transition={{ duration: 0.3 }}
                          className={`text-xs font-medium px-2 py-1 rounded-full transition-all duration-300 text-white`}
                        >
                          {isFaceDetected ? "Rostro detectado ✓" : faceDetectionMessage}
                        </motion.span>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 mb-3"
                      >
                        <Camera className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                      </motion.div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Cámara desactivada</p>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="sm"
                          onClick={startCamera}
                          className="bg-gradient-to-r from-blue-500 to-primary hover:from-blue-600 hover:to-primary/90 text-white"
                        >
                          <Camera className="h-4 w-4 mr-2" /> Activar cámara
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Información de depuración */}
                <AnimatePresence>
                  {debugInfo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-20"
                    >
                      <p className="font-mono">{debugInfo}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center mt-4"
                >
                  <p className="text-xs text-gray-500">
                    {isFaceRegistered
                      ? "Tu rostro ha sido registrado y se utilizará para verificar tu identidad al iniciar sesión."
                      : faceReadyForRegistration
                        ? "Revisa la imagen capturada y confirma el registro biométrico."
                        : "Posiciona tu rostro frente a la cámara y mantente quieto para completar el registro biométrico."}
                  </p>
                </motion.div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Atrás
                </Button>
                <Button
                  onClick={handleRegister}
                  disabled={isLoading || (!isFaceRegistered && (isCameraActive || faceReadyForRegistration))}
                >
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
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Reemplazar el return principal con esta versión mejorada
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-gray-200/50 dark:border-gray-700/30 shadow-xl">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-12 h-12 mb-2"
            >
              <LogoIcon />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Crear cuenta
            </CardTitle>
            <CardDescription className="text-center">Ingresa tus datos para registrarte en CleverPay</CardDescription>

            {/* Progress steps */}
            <div className="w-full flex items-center justify-between mt-4 px-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 * i }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step === i
                        ? "bg-primary text-white"
                        : step > i
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-500 dark:bg-gray-700"
                    }`}
                  >
                    {step > i ? <CheckCircle className="h-5 w-5" /> : i}
                  </motion.div>
                  <span className="text-xs mt-1">{i === 1 ? "Datos" : i === 2 ? "Seguridad" : "Biometría"}</span>
                </div>
              ))}
            </div>
          </CardHeader>

          <form onSubmit={handleRegister}>
            <CardContent>{renderStep()}</CardContent>

            <CardFooter className="flex flex-col">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center w-full mt-4 text-sm"
              >
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Iniciar sesión
                </Link>
              </motion.div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

