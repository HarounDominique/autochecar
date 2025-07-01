import "./globals.css";

export const metadata = {
  title: "autochecar",
  description: "Toda la información que necesitas sobre vehículos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
    <body>{children}</body>
    </html>
  );
}
