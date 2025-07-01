import DashboardLayout from "./dashboard/layout";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4 text-white">Bienvenido a Autochecar</h1>
        <p className="text-white">Usa el menú para navegar o iniciar sesión.</p>
      </div>
    </DashboardLayout>
  );
}
