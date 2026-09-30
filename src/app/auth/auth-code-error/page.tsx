import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="mx-auto mt-16 max-w-md text-center">
      <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
      <p className="text-card-foreground mt-4">
        Something went wrong during authentication. Please try again or contact
        support.
      </p>
      <Link
        href="/login"
        className="mt-6 inline-block rounded-md border px-4 py-2 hover:bg-amber-300"
      >
        Back to login
      </Link>
    </div>
  )
}
