import Link from "next/link";
import { Button } from "./ui/button";
import DarkModeToggle from "./ui/Darkmode";
import Logout from "./Logout";
import { getUser } from "@/auth/server";
import { SidebarTrigger } from "./ui/sidebar";
import MoreOptions from "./MoreOptions";

export default async function Header() {
  const user = await getUser();
  const isUserLogged = user !== null;

  return (
    <header className="bg-popover text-primary rounded-2xl p-4 shadow-2xl shadow-amber-200 hover:shadow-orange-400">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Sidebar Trigger + Logo */}
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <Link href={"/"} className="flex items-center gap-4">
            <img
              src="./image.png"
              alt="notes"
              className="border-red size-10 rounded-full border"
            />
            <h1 className="text-primary text-xl leading-6 font-bold sm:text-3xl sm:leading-8">
              NotesGOD
            </h1>
          </Link>
        </div>

        {/* Right: Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
          {isUserLogged ? (
            <>
              <MoreOptions />
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
