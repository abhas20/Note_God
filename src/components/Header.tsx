import Link from 'next/link'
import { Button } from './ui/button'
import DarkModeToggle from './ui/Darkmode'
import Logout from './Logout'
import { getUser } from '@/auth/server'
import { SidebarTrigger } from './ui/sidebar'
import MoreOptions from './MoreOptions'
import Image from 'next/image'
import HeaderNav from './HeaderNav'

export default async function Header() {
  const user = await getUser()
  const isUserLogged = user !== null

  return (
    <header className="sticky top-4 z-40 mx-4 rounded-2xl border border-indigo-100/40 bg-white/70 px-6 py-3.5 shadow-lg shadow-indigo-500/5 backdrop-blur-lg transition-all duration-300 hover:border-indigo-500/30 hover:shadow-indigo-500/8 dark:border-zinc-800/50 dark:bg-zinc-900/75 dark:shadow-none dark:hover:border-indigo-400/20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Sidebar Trigger + Logo */}
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <Link href={'/'} className="group flex items-center gap-3">
            <div className="relative overflow-hidden rounded-full border border-indigo-200/50 p-0.5 transition-transform duration-300 group-hover:scale-110 dark:border-zinc-700/60">
              <Image
                src="/image.png"
                alt="notes"
                width={36}
                height={36}
                className="size-9 rounded-full"
              />
            </div>
            <h1 className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-xl font-extrabold tracking-tight text-transparent sm:text-2xl dark:from-indigo-400 dark:to-indigo-300">
              NotesGOD
            </h1>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links (Show only if logged in) */}
        {isUserLogged && <HeaderNav />}

        {/* Right: Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
          {isUserLogged ? (
            <>
              <div className="lg:hidden">
                <MoreOptions />
              </div>
              <Logout />
              <Button asChild variant="outline3d">
                <Link href="/profile">Profile</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline3d">
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                variant="threeD"
                className="hidden sm:inline-flex"
              >
                <Link href="/signup">SignUp</Link>
              </Button>
            </>
          )}
          <DarkModeToggle />
        </div>
      </div>
    </header>
  )
}
