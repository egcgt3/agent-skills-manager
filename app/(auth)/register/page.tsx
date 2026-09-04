"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

/**
 * Register Page - CSR (Client-Side Rendering)
 * Uses client-side state for form handling and registration
 */
export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (!isLoading && isAuthenticated) {
    router.push("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ email, password, name });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="card-title text-2xl justify-center">Create Account</h1>
      <p className="text-center text-base-content/70">
        Join to create and share agent skills
      </p>

      <form onSubmit={handleSubmit} className="mt-4">
        {error && (
          <div className="alert alert-error mb-4" role="alert">
            <span>{error}</span>
          </div>
        )}

        <div className="form-control">
          <label className="label" htmlFor="register-name">
            <span className="label-text">Name</span>
          </label>
          <input
            id="register-name"
            type="text"
            placeholder="Your name"
            className="input input-bordered w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-control mt-4">
          <label className="label" htmlFor="register-email">
            <span className="label-text">Email</span>
          </label>
          <input
            id="register-email"
            type="email"
            placeholder="you@example.com"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-control mt-4">
          <label className="label" htmlFor="register-password">
            <span className="label-text">Password</span>
          </label>
          <input
            id="register-password"
            type="password"
            placeholder="••••••••"
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            aria-invalid={!!error}
          />
        </div>

        <div className="form-control mt-4">
          <label className="label" htmlFor="register-confirm-password">
            <span className="label-text">Confirm Password</span>
          </label>
          <input
            id="register-confirm-password"
            type="password"
            placeholder="••••••••"
            className="input input-bordered w-full"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            aria-invalid={!!error}
          />
        </div>

        <div className="form-control mt-6">
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span
                  className="loading loading-spinner loading-sm"
                  aria-hidden="true"
                ></span>
                <span className="sr-only">Creating account…</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </div>
      </form>

      <div className="divider">OR</div>

      <p className="text-center">
        Already have an account?{" "}
        <Link href="/login" className="link link-primary">
          Sign in
        </Link>
      </p>
    </>
  );
}