import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Providers } from "./providers";

export const metadata = {
  title: "Luminary Gifts Store",
  description: "Gifts Store Online Shopping",
};

export default async function RootLayout({ children }) {
  const session = await auth();
  return (
    <html lang="en">
      <body>
        <SessionProvider session={session} key={session?.user?.id}>
          <Providers>
            {children}
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}