import "./globals.css";
import { Providers } from "./providers";
import AuthProvider from "@/components/AuthProvider";

export const metadata = {
  title: "Luminary Gifts Store",
  description: "Gifts Store Online Shopping",
};

export default async function RootLayout({ children, session }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Providers>
            {children}
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}