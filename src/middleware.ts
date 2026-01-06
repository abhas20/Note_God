import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'


export async function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname === "/auth/callback" ||
    request.nextUrl.pathname === "/auth/auth-code-error"
  ) {
    return NextResponse.next();
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
          cookiesToSet.forEach(({ name, value}) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )


  // const currPath = request.nextUrl;
  // const isResetPasswordRoute = currPath.pathname.startsWith('/auth/reset-password');

  // const public_routes=["/login", "/signup", "/auth/forgot-password"]
  // const isPublicRoute = public_routes.some(route => currPath.pathname.startsWith(route));

  // if(!isPublicRoute){
  //    const {
  //     data: { user },
  //   } = await supabase.auth.getUser();
  //   if(!user) return NextResponse.redirect(new URL("/login",process.env.NEXT_PUBLIC_URL))
  // }
  const {
      data: { user },
    } = await supabase.auth.getUser();

  const AuthRoute =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/signup" ||
    request.nextUrl.pathname === "/auth/forgot-password";

  if (AuthRoute) {
    if (user) {
      return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_URL));
    }
  }
  // If the user is not authenticated and the request is not for an auth route
  // middleware works for both server and client components
  if (!user && !AuthRoute && !request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_URL));
  }


  const {searchParams,pathname}=new URL(request.url)
  if (!searchParams.get("noteId") && pathname === "/"){

    //  const {
    //   data: { user },
    // } = await supabase.auth.getUser();

    //    if (user) {
    //   // Try fetching the latest note
    //   try {
    //     const {newNoteId} = await fetch(
    //       `${process.env.NEXT_PUBLIC_URL}/api/fetch-latest-note?userId=${user.id}`,

    //     ).then((res) => res.json());
  
    //     if (newNoteId) {
    //       const url = request.nextUrl.clone();
    //       url.searchParams.set("noteId", newNoteId);
    //       return NextResponse.redirect(url);
    //     }
    //     else{
    //     // If no note exists, create one
    //     const createNote = await fetch(
    //       `${process.env.NEXT_PUBLIC_URL}/api/create-new-note?userId=${user.id}`,
    //       {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" }
    //       }
    //     );
    //     const { noteId: createdNoteId } = await createNote.json();
  
    //     const url = request.nextUrl.clone();
    //     url.searchParams.set("noteId", createdNoteId);
    //     return NextResponse.redirect(url);
    //   }
    //   } 
    //   catch (error) {
    //       console.log(error)  
    //   }
    //   }


      return NextResponse.next();
    }



  return supabaseResponse
}