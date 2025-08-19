// app/layout.js
import "./globals.css";

export const metadata = {
  title: "how2guess",
  description: "A daily life-or-death guessing game. Choose wisely.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-display">
        {children}
      </body>
    </html>
  );
}
