"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  DefaultValues,
  FieldValues,
  SubmitHandler,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import { z, ZodType } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { FIELD_NAMES } from "@/constants";
import { FIELD_TYPES } from "@/constants";

import { Path } from "react-hook-form";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";

interface Props<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string }>;
  type: "SIGN_IN" | "SIGN_UP";
}

const AuthForm = <T extends FieldValues>({
  type,
  schema,
  defaultValues,
  onSubmit,
}: Props<T>) => {
  const router = useRouter();
  const isSignIn = type === "SIGN_IN";

  const form: UseFormReturn<T> = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    const result = await onSubmit(data);

    if (result.success) {
      toast("Success!", {
        description: isSignIn
          ? "You have successfully signed in!"
          : "You have successfully signed up",
          style: {
    background: "#16a34a",
    color: "#ffffff",
    border: "1px solid #14532d",
          }
      });

      // Use window.location for full page reload to ensure session is loaded
      window.location.href = "/";
    } else {

      toast (`Error! ${isSignIn ? "Signing in" : "Signing up"}`, {
        description: result.error ?? "An error occurred",
          style: {
    background: "#dc2626",
    color: "#ffffff",
    border: "1px solid #991b1b",
                 },
      });

    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl sm:text-2xl font-semibold text-light-800">
        {isSignIn ? "Welcome to Sanbry's!" : "Create your account"}
      </h1>
      <p className="text-sm sm:text-base text-light-800">
        {isSignIn
          ? "Access the vast collection of resources"
          : "Please complete all fields to create your account"}
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6 w-full"
        >
          {Object.keys(defaultValues).map((field) => (
            <FormField
              key={field}
              control={form.control}
              name={field as Path<T>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize text-light-800">
                    {FIELD_NAMES[field.name as keyof typeof FIELD_NAMES]}
                  </FormLabel>
                  <FormControl>
                    <Input
                      required
                      type={FIELD_TYPES[field.name as keyof typeof FIELD_TYPES]}
                      {...field}
                      className="form-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <Button type="submit" className="form-btn">
            {isSignIn ? "Sign In " : "Sign Up"}
          </Button>
        </form>
      </Form>

      {isSignIn && (
        <div className="text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-light-800 hover:text-primary transition-colors"
          >
            Forgot your password?
          </Link>
        </div>
      )}

      <p className="text-center text-sm sm:text-base font-medium text-light-800">
        {isSignIn ? "New to Sanbry's? " : "Already have an account? "}

        <Link
          href={isSignIn ? "/sign-up" : "/sign-in"}
          className="font-bold text-primary"
        >
          {isSignIn ? "Create an account " : "Sign in"}
        </Link>
      </p>
    </div>
  );
};
export default AuthForm;
