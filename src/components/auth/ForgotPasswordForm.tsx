"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { forgotPassword } from "@/lib/actions/auth";
import { Button, Field, Input } from "@/components/ui";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await forgotPassword(email);
      if (result.ok) {
        setSent(true);
      } else {
        setError(result.error ?? "Could not send reset email.");
      }
    });
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <MailCheck className="mx-auto h-10 w-10 text-emerald-600" />
        <h2 className="mt-3 text-lg font-bold text-emerald-900">Check your email</h2>
        <p className="mt-1 text-sm text-emerald-800">
          We sent a password reset link to <strong>{email}</strong>. Follow the link to set a new password.
        </p>
        <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-teal-700 hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <p className="text-sm text-slate-500">
        Enter the email linked to your account and we will send you a reset link.
      </p>
      <Field label="Email">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
      </Field>
      <Button type="submit" loading={pending} className="w-full">
        Send reset link
      </Button>
      <p className="text-center text-sm text-slate-500">
        Remembered?{" "}
        <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-700">Login</Link>
      </p>
    </form>
  );
}