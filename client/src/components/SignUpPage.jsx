import React from "react";
import { SignUp } from "@clerk/clerk-react";

function SignUpPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-end p-4">
        {/* You can add any header content here */}
      </header>
      <main className="flex-grow flex items-center justify-center">
        <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" forceRedirectUrl="/edit" />
      </main>
    </div>
  );
}

export default SignUpPage;
