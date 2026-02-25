import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import styles from "./welcome.module.css";

export default async function WelcomePage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome</h1>
        <p className={styles.subtitle}>
          You’re signed in. This is your dashboard — we’ll add more here soon.
        </p>
      </div>
    </main>
  );
}
