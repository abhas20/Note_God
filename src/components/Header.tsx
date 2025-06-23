import Link from "next/link";
import { Button } from "./ui/button";
import DarkModeToggle from "./ui/Darkmode";
import Logout from "./Logout";
import { getUser } from "@/auth/server";
import { SidebarTrigger } from "./ui/sidebar";

export default async function Header() {
  const user = await getUser();
  const isUserLogged = user !== null;

  return (
    <header className="bg-popover text-primary p-4 shadow-amber-200 shadow-2xl hover:shadow-orange-400 rounded-2xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        
        {/* Left: Sidebar Trigger + Logo */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="sm:hidden" />
          <Link href={"/"} className="flex items-center gap-4">
            <img
              src="https://th.bing.com/th/id/OIP.SgBy5pmiLQHM-ngs1k0OTgHaHa?w=156&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7"
              alt="notes"
              className="rounded-full border border-red size-10"
            />
            <h1 className="text-xl sm:text-3xl font-bold leading-6 sm:leading-8 text-primary">
              Notes😎 <span className="block sm:inline ml-0 sm:ml-8">GOD ..</span>
            </h1>
          </Link>
        </div>

        {/* Right: Buttons */}
        <div className="flex flex-wrap justify-end items-center gap-3 sm:gap-4">
          {isUserLogged ? (
            <>
              <Logout />
              <Button asChild variant="outline">
                <Link href="/profile">Profile</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="hidden sm:block">
                <Link href="/signup">SignUp</Link>
              </Button>
            </>
          )}
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
