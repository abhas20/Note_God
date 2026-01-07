import Form from "@/components/Form";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

export default function page() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Card className="m-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-semibold">
            Signup
          </CardTitle>
        </CardHeader>
        <Form type="signup" />
      </Card>
    </div>
  );
}
