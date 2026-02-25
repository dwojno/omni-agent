"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        Home
      </Link>
      <nav className={styles.nav}>
        <SignedOut>
          <SignInButton mode="modal">
            <button type="button" className={styles.btnSecondary}>
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button type="button" className={styles.btnPrimary}>
              Get started
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link href="/welcome" className={styles.link}>
            Dashboard
          </Link>
          <UserButton
            appearance={{
              elements: {
                avatarBox: styles.avatarBox,
              },
            }}
          />
        </SignedIn>
      </nav>
    </header>
  );
}
