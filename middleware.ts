import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rutas que no requieren autenticación
const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"]

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value
  const { pathname } = request.nextUrl

  // Si la ruta es pública, permitir acceso
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    // Si el usuario ya está autenticado y trata de acceder a una ruta pública,
    // redirigir al dashboard
    if (sessionToken && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  // Si la ruta requiere autenticación y el usuario no está autenticado,
  // redirigir al login
  if (!sessionToken) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(pathname))
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't require authentication
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth/session|api/auth/login|api/auth/register).*)",
  ],
}
