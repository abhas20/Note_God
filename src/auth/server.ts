import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { logger } from '@/lib/logger'

export async function createClient() {
  const cookieStore = await cookies()

  const client = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch (error) {
            // console.error(`Failed to set cookie :`, error)
            logger.error({ error }, 'Failed to set cookie')
          }
        },
      },
    },
  )
  return client
}

export async function _getUser() {
  const { auth } = await createClient()
  const userObject = await auth.getUser()
  if (userObject.error) {
    // console.log(userObject.error)
    logger.error({ error: userObject.error }, 'Failed to get user')
  }
  return userObject.data.user
}

export const getUser = cache(_getUser)
