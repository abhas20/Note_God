'use client'
import { forgetPassword } from '@/action/user'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

function ForgotPasswordPage() {
    const [ email, setEmail] = useState<string>("");
    const [isPending,startTransition]= useTransition();

    const handleSubmit=()=>{
        startTransition(async()=>{
            if(!email.trim()){
                toast.error("Error", {
                    description: "Email is required.",
                    duration: 3000,
                });
                return;
            }
            else{
                const res=await forgetPassword(email.toLowerCase());
                if(!res){
                    toast.error("Error",{
                        description: "Something went wrong",
                        duration:3000,
                    })
                    return;
                }
                if(res.errorMessage){
                    toast.error("Error",{
                        description: res.errorMessage,
                        duration:3000,
                    })
                }
                else{
                    toast.success("Email sent successfully",{
                        description:"check your mail to reset password",
                        duration:3000,
                    })
                }
            }
        })
    }

  return (
    <div className='flex flex-col justify-center items-center h-screen'>
      <Card className='w-full m-auto max-w-md'>
        <CardHeader>
        <CardTitle className='font-semibold text-3xl text-center'>Forgot Password</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 w-full">
          <>
        <Label htmlFor="email">Email: </Label> 
        <Input type="email" name="email" id ="email" placeholder="Email" value={email} onChange={(e)=>{setEmail(e.target.value)}} required/>
        <Link href="/login" className='text-muted-foreground text-right hover:underline text-sm'>Back to Login</Link>
          </>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
        <Button type="submit" variant="default" className="w-full gap-4 mt-5 " onClick={handleSubmit}>{isPending?<Loader2 className='animate-spin'/>:"Submit"}</Button>
        </CardFooter>
        </Card>
    </div>
  )
}

export default ForgotPasswordPage
