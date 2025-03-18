import type {NextRequest} from "next/server"
import {NextResponse} from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/"

  // Get session from cookie
  const sessionCookie = request.cookies.get("session")?.value

  // If no session and trying to access protected route, redirect to login
  if (!sessionCookie && !isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If session exists and user is on login page, redirect to appropriate dashboard
  if (sessionCookie && isPublicPath) {
    try {
      const session = JSON.parse(sessionCookie)
      if (session?.user?.role === "teacher") {
        return NextResponse.redirect(new URL("/admin", request.url))
      } else {
        return NextResponse.redirect(new URL("/vote", request.url))
      }
    } catch (e) {
      // If session is invalid, clear it and redirect to login
      const response = NextResponse.redirect(new URL("/", request.url))
      response.cookies.delete("session")
      return response
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/", "/vote", "/admin"],
}

