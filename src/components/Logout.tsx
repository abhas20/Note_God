"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { logOut } from "@/action/user";

export default function Logout() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleLogout = async () => {
    setLoading(true);
    const errorMessage = (await logOut()).errorMessage;
    if (!errorMessage) {
      toast.success("Logged Out", {
        description: "Successfully Logged out",
        duration: 3000,
      });
      <Toaster richColors />;
      router.push("/");
    } else {
      <Toaster richColors />;
      toast.error("Error", {
        description: errorMessage,
        duration: 3000,
      });
    }
    setLoading(false);
  };

  return (
    <Button variant="outline" onClick={handleLogout} disabled={loading}>
      {loading ? <Loader2 className="animate-spin" /> : "LogOut"}
    </Button>
  );
}
