import React from "react";
import { SignIn } from "@clerk/clerk-react";

function SignInPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-end p-4">
        {/* Header content can go here if needed */}
      </header>
      <main className="flex-grow flex items-center justify-center">
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" forceRedirectUrl="/edit" />
      </main>
    </div>
  );
}

export default SignInPage;
