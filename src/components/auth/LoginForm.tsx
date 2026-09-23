"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signInWithEmail } from "@/lib/actions/auth";
import { Button, Field, Input } from "@/components/ui";
import { useToast } from "@/components/Toast";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    startTransition(async () => {
      const result = await signInWithEmail(email, password);
      if (result.ok) {
        toast("Welcome back!", "success");
        const next = searchParams.get("next");
        router.replace(next && next.startsWith("/") && !next.startsWith("/login") ? next : "/");
        router.refresh();
      } else {
        setError(result.error ?? "Login failed.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <Field label="Email">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </Field>

      <Field label="Password">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      <div className="flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="font-medium text-teal-600 hover:text-teal-700">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" loading={pending} className="w-full">
        Login
      </Button>

      <p className="text-center text-sm text-slate-500">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-teal-600 hover:text-teal-700">
          Create an account
        </Link>
      </p>
    </form>
  );
}