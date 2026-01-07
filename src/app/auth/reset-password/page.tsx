"use client";
import { resetPassword } from "@/action/user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
import { toast } from "sonner";

function ResetPasswordPage() {
  const [data, setData] = useState({
    password: "",
    confirm_password: "",
  });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = () => {
    startTransition(async () => {
      if (!data.password.trim() || !data.confirm_password.trim()) {
        toast.error("Error", {
          description: "Password and confirm password are required.",
          duration: 3000,
        });
        return;
      }
      if (data.password !== data.confirm_password) {
        toast.error("Error", {
          description: "Passwords do not match.",
          duration: 3000,
        });
        return;
      }
      const errorMsg = (await resetPassword(data.password)).errorMessage;
      if (errorMsg) {
        toast.error("Error", {
          description: errorMsg,
          duration: 3000,
        });
      } else {
        toast.success("Password reset successfully", {
          description: "You can now login with your new password",
          duration: 3000,
        });
        router.push("/");
      }
    });
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Card className="m-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-semibold">
            Forgot Password
          </CardTitle>
        </CardHeader>
        <CardContent className="grid w-full gap-3">
          <>
            <Label htmlFor="password">Password: </Label>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              value={data.password}
              onChange={(e) => {
                setData({ ...data, password: e.target.value });
              }}
              required
            />
          </>
          <>
            <Label htmlFor="confirn_password">Confirm Password: </Label>
            <Input
              type="password"
              name="confirn_password"
              id="confirn_password"
              placeholder="Confirm Password"
              value={data.confirm_password}
              onChange={(e) => {
                setData({ ...data, confirm_password: e.target.value });
              }}
              required
            />
          </>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            variant="default"
            className="mt-5 w-full gap-4"
            onClick={handleSubmit}
          >
            {isPending ? <Loader2 className="animate-spin" /> : "Submit"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default ResetPasswordPage;
