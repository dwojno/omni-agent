import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <SignUp
        appearance={{
          variables: {
            colorBackground: "#161920",
            colorInputBackground: "#252830",
            colorInputText: "#e5e7eb",
            colorText: "#e5e7eb",
            colorTextSecondary: "#9ca3af",
            borderRadius: "0.75rem",
          },
        }}
      />
    </main>
  );
}
