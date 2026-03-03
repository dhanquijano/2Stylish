"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        toast.success("Password reset email sent!", {
          description: "Check your email for the reset link.",
        });
      } else {
        toast.error("Error", {
          description: result.error || "Failed to send reset email",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col gap-6 max-w-md mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-light-800 mb-2">
            Check your email
          </h1>
          <p className="text-light-800 mb-6">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-light-500 mb-6">
            Didn't receive the email? Check your spam folder or try again.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => setIsSubmitted(false)}
            variant="outline"
            className="w-full"
          >
            Try another email
          </Button>
          <Link href="/sign-in">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-light-800 mb-2">
          Forgot your password?
        </h1>
        <p className="text-light-800">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-light-800">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="form-input"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="form-btn"
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <Link href="/sign-in">
        <Button variant="ghost" className="w-full text-light-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to sign in
        </Button>
      </Link>
    </div>
  );
};

export default ForgotPasswordPage;
