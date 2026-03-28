import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname === '/auth/callback' ||
    request.nextUrl.pathname === '/auth/auth-code-error'
  ) {
    return NextResponse.next()
  }

  return await updateSession(request)
}

export const config = {
  /*
   * Runs middleware on all request paths except for the ones starting with:
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

// export async function updateSession(request: NextRequest) {
//   let supabaseResponse = NextResponse.next({
//     request,
//   });

//   const supabase = createServerClient(
//     process.env.SUPABASE_URL!,
//     process.env.SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll();
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value }) =>
//             request.cookies.set(name, value),
//           );
//           supabaseResponse = NextResponse.next({
//             request,
//           });
//           cookiesToSet.forEach(({ name, value, options }) =>
//             supabaseResponse.cookies.set(name, value, options),
//           );
//         },
//       },
//     },
//   );

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   const AuthRoute =
//     request.nextUrl.pathname === "/login" ||
//     request.nextUrl.pathname === "/signup" ||
//     request.nextUrl.pathname === "/auth/forgot-password";

//   if (AuthRoute) {
//     if (user) {
//       return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_URL));
//     }
//   }
//   // If the user is not authenticated and the request is not for an auth route
//   // middleware works for both server and client components
//   if (!user && !AuthRoute && !request.nextUrl.pathname.startsWith("/api")) {
//     return NextResponse.redirect(
//       new URL("/login", process.env.NEXT_PUBLIC_URL),
//     );
//   }

//   const { searchParams, pathname } = new URL(request.url);
//   if (!searchParams.get("noteId") && pathname === "/") {
//     return NextResponse.next();
//   }

//   return supabaseResponse;
// }

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // This refreshes the session if needed
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute =
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signup' ||
    request.nextUrl.pathname === '/auth/forgot-password'

  // 1. If logged in and trying to access an auth route, redirect to home
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // 2. If NOT logged in, NOT on an auth route, and NOT calling an API, redirect to login
  if (!user && !isAuthRoute && !request.nextUrl.pathname.startsWith('/api')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 3. Always return the supabaseResponse so cookies are properly set
  return supabaseResponse
}
