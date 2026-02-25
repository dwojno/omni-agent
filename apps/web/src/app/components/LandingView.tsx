"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import Link from "next/link";
import styles from "./LandingView.module.css";

export function LandingView() {
  return (
    <>
      <SignedOut>
        <section className={styles.hero}>
          <h1 className={styles.title}>
            Build something that matters
          </h1>
          <p className={styles.subtitle}>
            Get started in seconds. Sign in or create an account to continue.
          </p>
          <div className={styles.ctas}>
            <SignUpButton mode="modal">
              <button type="button" className={styles.ctaPrimary}>
                Create account
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button type="button" className={styles.ctaSecondary}>
                Sign in
              </button>
            </SignInButton>
          </div>
        </section>
      </SignedOut>
      <SignedIn>
        <section className={styles.welcomeBack}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>
            Head to your dashboard to get started.
          </p>
          <Link href="/welcome" className={styles.ctaPrimary}>
            Go to dashboard
          </Link>
        </section>
      </SignedIn>
    </>
  );
}
