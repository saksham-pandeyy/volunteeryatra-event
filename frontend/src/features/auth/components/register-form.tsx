"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { notify } from "@/common/utils";
import { useAuth } from "../hooks";
import { registerSchema } from "@/common/utils";
import { Button, Input, SkeletonForm, SkeletonText } from "@/components/ui";

interface FormErrors { name?: string; email?: string; password?: string }

function RegisterFormContent() {
  const { register, registerLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = registerSchema.safeParse({ name, email, password });
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    try {
      await register(name, email, password);
    } catch (err: unknown) {
      const error = err as { data?: { error?: { message?: string } } };
      notify.error(error?.data?.error?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="guest-form-container w-full">
      <h2 className="text-2xl font-bold mb-6 text-center text-foreground tracking-wider uppercase">
        Create Account
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          error={errors.name} 
          placeholder="Your full name" 
        />
        
        <Input 
          label="Email Address" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          error={errors.email} 
          placeholder="you@example.com" 
        />
        
        <Input 
          label="Password" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          error={errors.password} 
          placeholder="At least 6 characters" 
        />

        <Button type="submit" loading={registerLoading} className="w-full mt-6">
          Register
        </Button>
      </form>

      <p className="text-muted mt-6 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-semibold">
          Sign In
        </Link>
      </p>
    </div>
  );
}

export function RegisterForm() {
  return (
    <Suspense fallback={
      <div className="guest-form-container w-full space-y-4">
        <SkeletonText className="mx-auto w-40 h-8 mb-6" />
        <SkeletonForm fields={3} />
      </div>
    }>
      <RegisterFormContent />
    </Suspense>
  );
}
