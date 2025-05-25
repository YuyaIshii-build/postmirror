// app/(auth)/layout.tsx
import "../globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner"; // 👈 追加

export const metadata: Metadata = {
  title: "ログイン | PostMirror",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-100">
        {children}
        <Toaster richColors closeButton /> {/* 👈 ここに追加 */}
      </body>
    </html>
  );
}