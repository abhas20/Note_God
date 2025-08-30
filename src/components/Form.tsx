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
import { loginAction, signupAction } from "@/action/user";

type Props={
    type:string,
}

export default function Form(type:Props) {
  const isLogin=type.type==="login";
  const router=useRouter();

  const [isPending,startTransition] = useTransition();
  const handleSubmit=(formData:FormData)=>{
    startTransition(async ()=>{
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
      let title;
      let description;
      if(isLogin){
        title="Logged in"
        description="You are logged in successfully"
        errorMsg=(await loginAction(email,password)).errorMessage;
      }
      else {
        title="Signed Up"
        description="You are signed up successfully"
        errorMsg=(await signupAction(email,password)).errorMessage;

      }

      if(errorMsg){
        toast.error("Error", {
          description:errorMsg,
          duration:3000
        });
        <Toaster richColors/>
      }
      else{
        toast.success(title, {
          description:description,
          duration:3000
        });
        <Toaster richColors/>
        router.push("/");
      }
    })
  }


  return (
    <div>
      <form className="flex flex-col items-center gap-5" action={handleSubmit}>
        <CardContent className="grid gap-3 w-full">
          <>
        <Label htmlFor="email">Email: </Label> 
        <Input type="email" name="email" id ="email" placeholder="Email" disabled={isPending} required/>
          </>
          <>
        <Label htmlFor="password">Password: </Label>
        <Input type="password" name="password" id="password" placeholder="Password" autoComplete="off" disabled={isPending} required/>
        {isLogin && <p className="text-sm text-right"><Link href={"/auth/forgot-password"}>Forgot Password?</Link></p>}
          </>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
        <Button type="submit" variant="default" className="w-full gap-4 mt-5 ">{isPending?<Loader2 className="animate-spin"/>:isLogin?"Login":"Sign Up"}</Button>
        <p className="text-center gap-4 text-xs">
          {isLogin?"Don't have an account?":"Already have an account?"}
          <Link href={isLogin?"/signup":"/login"} className={`blue-500 underline ${isPending? "pointer-events-none opacity-40":""}`}>{isLogin?"Sign Up":"Login"}</Link>
        </p>
        </CardFooter>
      </form>
    </div>
  )
}
