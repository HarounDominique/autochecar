import "./globals.css";

export const metadata = {
  title: "Tu app",
  description: "Descripción de la app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
    <body>{children}</body>
    </html>
  );
}
