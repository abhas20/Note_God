import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'


export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
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

  const AuthRoute=request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup"
  if(AuthRoute){
    const {
    data: { user },
  } = await supabase.auth.getUser()
  if(user){
    return NextResponse.redirect(new URL("/",process.env.NEXT_PUBLIC_URL))
  }
  }

  const {searchParams,pathname}=new URL(request.url)
  if (!searchParams.get("noteId") && pathname === "/"){
    const {
        data: { user },
      } = await supabase.auth.getUser()

       if (user) {
      // Try fetching the latest note
      const fetchLatest = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/fetch-latest-note?userId=${user.id}`,
        { cache: 'no-store' }
      );
      const { newNoteId } = await fetchLatest.json();

      if (newNoteId) {
        const url = request.nextUrl.clone();
        url.searchParams.set("noteId", newNoteId);
        return NextResponse.redirect(url);
      }

      // If no note exists, create one
      const createNote = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/create-new-note?userId=${user.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        }
      );
      const { noteId: createdNoteId } = await createNote.json();

      const url = request.nextUrl.clone();
      url.searchParams.set("noteId", createdNoteId);
      return NextResponse.redirect(url);
      }
    }



  return supabaseResponse
}