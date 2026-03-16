"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "@/lib/toast";
import { useRouter, useSearchParams } from "next/navigation";

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link");
      router.push("/sign-in");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Password reset successful!", {
          description: "You can now sign in with your new password.",
        });
        router.push("/sign-in");
      } else {
        toast.error("Error", {
          description: result.error || "Failed to reset password",
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

  if (!token) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-light-800 mb-2">
          Reset your password
        </h1>
        <p className="text-light-800">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-light-800">
            New Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
            minLength={8}
            className="form-input"
          />
          <p className="text-xs text-light-500">
            Must be at least 8 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-light-800">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            minLength={8}
            className="form-input"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="form-btn"
        >
          {isSubmitting ? "Resetting..." : "Reset password"}
        </Button>
      </form>

      <Link href="/sign-in">
        <Button variant="ghost" className="w-full text-light-800">
          Back to sign in
        </Button>
      </Link>
    </div>
  );
};

export default ResetPasswordPage;
