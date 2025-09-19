// app/layout.js
import "./globals.css";

export const metadata = {
  title: "had2guess",
  description: "A daily life-or-death guessing game. Choose wisely.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <body className="h-full font-display">
        {children}
      </body>
    </html>
  );
}
