"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { CardContent, CardFooter } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import { loginAction, loginWithGoogle, signupAction } from "@/action/user";

type Props={
    type:string,
}

export default function Form(type:Props) {
  const isLogin=type.type==="login";
  const router=useRouter();

  const [isPending,startTransition] = useTransition();
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      // console.log(formData);
      if (!email || !password) {
        toast.error("Error", {
          description: "Email and password are required.",
          duration: 3000,
        });
        return;
      }
      let errorMsg;

      if (isLogin) {
        errorMsg = (await loginAction(email, password)).errorMessage;
        if (!errorMsg) {
          toast.success("Logged In", {
            description: "You have been successfully logged in.",
          });
          router.push("/");
        }
      } else {
        errorMsg = (await signupAction(email, password)).errorMessage;
        if (!errorMsg) {
          toast.success("Confirmation Email Sent", {
            description: "Please check your inbox to complete the signup.",
            duration: 5000,
          });
        }
      }

      if (errorMsg) {
        toast.error("Error", {
          description: errorMsg,
        });
      }
    });
  };


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
  );
  
// type GoogleLoginResponse = {
//   errorMessage?: string | null;
//   data?: {
//     url?: string;
//     [key: string]: any;
//   };
//   url?: string;
// };

const handleGoogleLogin = () => {
        startTransition( () => {
           loginWithGoogle();
        });
};

  return (
    <div>
      <form className="flex flex-col items-center gap-5" action={handleSubmit}>
        <CardContent className="grid w-full gap-3">
          <>
            <Label htmlFor="email">Email: </Label>
            <Input
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              disabled={isPending}
              required
            />
          </>
          <>
            <Label htmlFor="password">Password: </Label>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              autoComplete="off"
              disabled={isPending}
              required
            />
            {isLogin && (
              <p className="text-right text-sm">
                <Link href={"/auth/forgot-password"}>Forgot Password?</Link>
              </p>
            )}
          </>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" variant="default" className="mt-5 w-full gap-4">
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : isLogin ? (
              "Login"
            ) : (
              "Sign Up"
            )}
          </Button>
          <p className="gap-4 text-center text-xs">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <Link
              href={isLogin ? "/signup" : "/login"}
              className={`blue-500 underline ${isPending ? "pointer-events-none opacity-40" : ""}`}
            >
              {isLogin ? "Sign Up" : "Login"}
            </Link>
          </p>
        </CardFooter>
      </form>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">
            Or continue with
          </span>
        </div>
      </div>

      <form action={handleGoogleLogin} className="px-6 pb-4">
        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon className="mr-2 h-4 w-4 text-foreground" />
          )}
          Sign In with Google
        </Button>
      </form>
    </div>
  );
}
