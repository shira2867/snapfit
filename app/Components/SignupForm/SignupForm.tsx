"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useMutation } from "@tanstack/react-query";

import styles from "./SignupForm.module.css";
import { FormData } from "@/types/userTypes";
import { auth } from "@/app/firebase/config";
import { useUserStore } from "@/store/userStore";
import { useToast } from "../Toast/ToastProvider";
import { useGoogleAuth } from "@/services/server/useGoogleAuth";

export default function SignupForm() {
  const { register, handleSubmit } = useForm<FormData>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = searchParams.get("next"); // string | null

  const setUserStore = useUserStore((state) => state.setUser);
  const { showToast } = useToast();

  const { signInWithGoogle, isLoading: isGoogleLoading } = useGoogleAuth();

  const registerUserMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to register user");

      return data;
    },
    onSuccess: (_data, variables) => {
      // Keep your existing logic: store user basics in Zustand
      setUserStore({
        name: variables.name || "",
        email: variables.email || null,
        profileImage: variables.profileImage ?? null,
        gender: null,
      });

      // After signup we usually want profile completion.
      // We keep "next" attached so you can redirect after profile is completed (if you implement it).
      router.replace(
        nextPath
          ? `/complete-profile?next=${encodeURIComponent(nextPath)}`
          : "/complete-profile"
      );
    },
    onError: (error: any) => {
      showToast(error.message || "Error creating account", "error");
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const firebaseUser = userCredential.user;

      registerUserMutation.mutate({
        email: firebaseUser.email,
        password: data.password,
        createdAt: new Date(),
      });
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        showToast(
          "The email is already registered. Please log in instead.",
          "error"
        );
      } else {
        console.error(error);
        showToast(error.message || "Error creating account", "error");
      }
    }
  };

  return (
    <div className={styles.signupPage}>
      <div className={styles.localHeader}>
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={210} height={210} />
        </Link>
      </div>

      <div className={styles.container}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <h2>Create Your Account</h2>

          {/* Google signup/login */}
          <button
            type="button"
            onClick={() => signInWithGoogle(nextPath)}
            className={styles.googleButton}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              "Continue..."
            ) : (
              <>
                <Image src="/google.png" alt="Google" width={18} height={18} />
                Continue with Google
              </>
            )}
          </button>

          <div className={styles.orDivider}>Or</div>

          <input
            {...register("email")}
            placeholder="Email address"
            className={styles.input}
          />
          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            className={styles.input}
          />

          <button type="submit" className={styles.button}>
            Create Account
          </button>

          <p className={styles.terms}>
            By creating an account, you agree to the{" "}
            <a href="#">Terms of Service</a> and{" "}
            <a href="#">Privacy Policy</a>.
          </p>

          <p className={styles.loginLink}>
            Already have an account?{" "}
            <a
              href={
                nextPath
                  ? `/login?next=${encodeURIComponent(nextPath)}`
                  : "/login"
              }
            >
              Log in here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
