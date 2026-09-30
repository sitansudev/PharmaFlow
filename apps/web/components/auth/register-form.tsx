"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pill } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/hooks/use-register";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth";

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  async function onSubmit({ confirmPassword: _confirmPassword, ...data }: RegisterFormValues) {
    try {
      await registerMutation.mutateAsync(data);
      toast.success("Your account has been created. Please sign in.");
      router.replace("/login");
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? error?.message ?? "Could not create your account");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white"><Pill className="h-7 w-7" /></div>
          <CardTitle className="text-3xl">Create your account</CardTitle>
          <CardDescription>Set up access to your PharmaFlow workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Full name" error={errors.fullName?.message}><Input autoComplete="name" {...register("fullName")} /></Field>
            <Field label="Email" error={errors.email?.message}><Input type="email" autoComplete="email" {...register("email")} /></Field>
            <Field label="Phone" error={errors.phone?.message}><Input type="tel" autoComplete="tel" {...register("phone")} /></Field>
            <Field label="Password" error={errors.password?.message}><Input type="password" autoComplete="new-password" {...register("password")} /></Field>
            <Field label="Confirm password" error={errors.confirmPassword?.message}><Input type="password" autoComplete="new-password" {...register("confirmPassword")} /></Field>
            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</> : "Create account"}
            </Button>
            <p className="text-center text-sm text-slate-600">Already have an account? <Link href="/login" className="font-medium text-blue-600 hover:underline">Sign in</Link></p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-sm text-red-500">{error}</p>}</div>;
}
