export default function AuthCodeErrorPage() {
  return (
    <div className="mx-auto mt-16 max-w-md text-center">
      <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
      <p className="mt-4 text-gray-700">
        Something went wrong during authentication. Please try again or contact
        support.
      </p>
      <a href="/login" className="mt-6 inline-block text-blue-500 underline">
        Back to login
      </a>
    </div>
  );
}
