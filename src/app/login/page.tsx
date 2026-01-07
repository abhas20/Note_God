import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import Form from "@/components/Form";

export default function page() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Card className="m-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-semibold">
            Login
          </CardTitle>
        </CardHeader>
        <Form type="login" />
      </Card>
    </div>
  );
}
