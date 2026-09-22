"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signUpWithEmail } from "@/lib/actions/auth";
import { Button, Field, Input } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { EMAIL_RE, PHONE_RE } from "@/lib/validation";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Please enter your name.");
    if (!EMAIL_RE.test(email)) return setError("Please enter a valid email address.");
    if (!PHONE_RE.test(phone)) return setError("Please enter a valid 10-digit Indian mobile number.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");

    startTransition(async () => {
      const result = await signUpWithEmail(email, password, name.trim(), phone.trim());
      if (result.ok) {
        toast("Account created! Please check your email to confirm.", "success");
        const next = searchParams.get("next");
        const query = new URLSearchParams();
        query.set("message", "confirm");
        if (next && next.startsWith("/") && !next.startsWith("/login")) query.set("next", next);
        router.replace(`/login?${query.toString()}`);
        router.refresh();
      } else {
        setError(result.error ?? "Sign up failed.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <Field label="Full name">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rakesh Kumar" required />
      </Field>

      <Field label="Mobile number">
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
          placeholder="10 digit mobile number"
          inputMode="numeric"
          required
        />
      </Field>

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
            autoComplete="new-password"
            placeholder="At least 8 characters"
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

      <Button type="submit" loading={pending} className="w-full">
        Create account
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-700">
          Login
        </Link>
      </p>
    </form>
  );
}