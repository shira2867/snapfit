"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/app/firebase/config";
import { useUserStore } from "@/store/userStore";
import { useToast } from "@/app/Components/Toast/ToastProvider";

export function useGoogleAuth() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const setUserId = useUserStore((state) => state.setUserId);
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNextFromUrl = () => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("next");
  };

  const signInWithGoogle = async (nextParam?: string | null) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1) Google sign-in
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const email = firebaseUser.email;
      if (!email) throw new Error("Google account has no email.");

      // 2) Sync user with DB (upsert)
      const registerRes = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: firebaseUser.displayName ?? "",
          email,
          profileImage: firebaseUser.photoURL ?? "",
        }),
      });

      if (!registerRes.ok) {
        throw new Error("Failed to sync user with server.");
      }

      // 3) Fetch full DB user (includes id)
      const userRes = await fetch(`/api/user?email=${encodeURIComponent(email)}`);
      if (!userRes.ok) throw new Error("Failed to load user data.");

      const { user: dbUser } = await userRes.json();

      // 4) Save to Zustand
      setUser({
        name: dbUser?.name ?? firebaseUser.displayName ?? null,
        email: dbUser?.email ?? email,
        profileImage: dbUser?.profileImage ?? firebaseUser.photoURL ?? null,
        gender: (dbUser?.gender as "male" | "female" | null) ?? null,
      });

      if (dbUser?.id) setUserId(dbUser.id);

      // 5) Set auth cookie (must succeed so middleware won't bounce)
      const idToken = await firebaseUser.getIdToken();
      const cookieRes = await fetch("/api/auth/set-cookie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!cookieRes.ok) {
        throw new Error("Failed to set authentication cookie.");
      }

      // 6) Redirect
      const next = nextParam ?? getNextFromUrl();
      const isProfileComplete = !!dbUser?.name && !!dbUser?.gender;

      if (next) {
        router.replace(next);
      } else if (!isProfileComplete) {
        router.replace("/complete-profile");
      } else {
        router.replace("/home");
      }

      showToast(isProfileComplete ? "Welcome back!" : "Account created successfully", "success");
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || "Google login failed";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return { signInWithGoogle, isLoading, error };
}
