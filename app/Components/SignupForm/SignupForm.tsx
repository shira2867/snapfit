"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signOut, User } from "firebase/auth";

import styles from "./SignupForm.module.css";
const firebaseConfig = {
  apiKey: "AIzaSyDiO9v_BzyyJ8C0W_M_pNvGFHGOH0rcn0E",
  authDomain: "modella-19e1a.firebaseapp.com",
  projectId: "modella-19e1a",
  storageBucket: "modella-19e1a.appspot.com",
  messagingSenderId: "950370790683",
  appId: "1:950370790683:web:c4b6c74355ac2bd7e077be"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

type FormData = {
  email: string;
  password: string;
};

export default function AuthForm() {
  const [user, setUser] = useState<User | null>(null);
  const { register, handleSubmit } = useForm<FormData>();

  // כניסה עם גוגל
  function signInWithGoogle() {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        setUser(user);

        // שמירה במסד MongoDB
        await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: user.displayName,
            email: user.email,
            profileImage: user.photoURL,
            gender: "female",
          }),
        });

        console.log("Signed in as:", user.displayName);
      })
      .catch(console.error);
  }

  // יצירת משתמש עם אימייל וסיסמה
  async function onSubmit(data: FormData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      setUser(user);

      // שמירה במסד MongoDB
      await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          createdAt: new Date(),
        }),
      });

      console.log("User registered:", user.email);
    } catch (error) {
      console.error(error);
    }
  }

  function signOutUser() {
    signOut(auth).then(() => setUser(null)).catch(console.error);
  }

    return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <input {...register("email")} placeholder="Email" className={styles.input} />
        <input {...register("password")} type="password" placeholder="Password" className={styles.input} />
        <button type="submit" className={styles.button}>Create Account</button>
          <button onClick={signInWithGoogle} className={styles.googleButton}>
        Sign in with Google
      </button>
      </form>

    

      {user && (
        <>
          {/* <button onClick={signOutUser} className={styles.googleButton}>
            Sign Out
          </button> */}

          <div className={styles.userInfo}>
            <h2>Welcome, {user.displayName || user.email}</h2>
            {user.photoURL && <Image src={user.photoURL} alt="Profile Picture" width={100} height={100} className={styles.profileImage} />}
          </div>
        </>
      )}
    </div>
  );
}