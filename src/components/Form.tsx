'use client'

import '../style/auth.css'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { loginAction, loginWithGoogle, signupAction } from '@/action/user'

type Props = {
  type: string
}

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.63 1.9-3.87 0-7-3.13-7-7s3.13-7 7-7c2.18 0 3.66.86 4.54 1.73l2.64-2.58C18.01 1.02 15.48 0 12.48 0c-6.9 0-12.5 5.6-12.5 12.5s5.6 12.5 12.5 12.5c7.25 0 12.13-4.87 12.13-12.5 0-.8-.08-1.55-.2-2.32h-11.9z" />
  </svg>
)

export default function Form({ type }: Props) {
  const isLogin = type === 'login'
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      if (!email || !password) {
        toast.error('Error', {
          description: 'Email and password are required.',
          duration: 3000,
        })
        return
      }

      let errorMsg

      if (isLogin) {
        errorMsg = (await loginAction(email, password)).errorMessage
        if (!errorMsg) {
          toast.success('Logged In', {
            description: 'You have been successfully logged in.',
          })
          router.push('/')
        }
      } else {
        errorMsg = (await signupAction(email, password)).errorMessage
        if (!errorMsg) {
          toast.success('Confirmation Email Sent', {
            description: 'Please check your inbox to complete the signup.',
            duration: 5000,
          })
        }
      }

      if (errorMsg) {
        toast.error('Error', { description: errorMsg })
      }
    })
  }

  const handleGoogleLogin = () => {
    startTransition(() => {
      loginWithGoogle()
    })
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <img src="/image.png" alt="NotesGOD logo" />
          </div>
          <h1 className="auth-brand-name">NotesGOD</h1>
        </div>

        {/* Heading */}
        <h2 className="auth-heading">{isLogin ? 'Login' : 'Sign Up'}</h2>

        {/* Email + Password form */}
        <form className="auth-form" action={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email" className="auth-label">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="you@example.com"
              disabled={isPending}
              required
              className="auth-input"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password" className="auth-label">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              autoComplete="off"
              disabled={isPending}
              required
              className="auth-input"
            />
            {isLogin && (
              <div className="auth-forgot">
                <Link href="/auth/forgot-password">Forgot Password?</Link>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="auth-btn-primary"
          >
            {isPending ? (
              <Loader2 className="auth-spinner" />
            ) : isLogin ? (
              'Login'
            ) : (
              'Sign Up'
            )}
          </button>

          <p className="auth-switch-text">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link
              href={isLogin ? '/signup' : '/login'}
              className={`auth-switch-link ${isPending ? 'auth-switch-link--disabled' : ''}`}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </Link>
          </p>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span className="auth-divider-line" />
          <span className="auth-divider-text">or continue with</span>
          <span className="auth-divider-line" />
        </div>

        {/* Google */}
        <form action={handleGoogleLogin}>
          <button
            type="submit"
            disabled={isPending}
            className="auth-btn-google"
          >
            {isPending ? (
              <Loader2 className="auth-spinner" />
            ) : (
              <GoogleIcon className="auth-google-icon" />
            )}
            Sign In with Google
          </button>
        </form>
      </div>
    </div>
  )
}
