import { createClient } from "@/auth/server";
import { prisma } from "@/db/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    // if "next" is not a relative URL, use the default
    next = "/";
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      const { data: userData, error: getuserError } = await supabase.auth.getUser();
      if (getuserError || !userData.user) {
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
      }
      // const user = userData.user;
      // if (!user.email || !user.id) {
      //   return NextResponse.redirect(`${origin}/auth/auth-code-error`);
      // }
      // console.log(user);
      // const res=await prisma.user.upsert({
      //   where: { id: user.id },
      //   update: {
      //     email: user.email,
      //     imgUrl: user.user_metadata?.avatar_url || null,
      //   },
      //   create: {
      //     id: user.id,
      //     email: user.email,
      //     imgUrl: user.user_metadata?.avatar_url || null,
      //   },
      // });
      // console.log(res);

      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

