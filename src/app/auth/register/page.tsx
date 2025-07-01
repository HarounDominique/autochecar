"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Sidebar from "@/components/Sidebar";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== repeatPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      alert("Error al registrarse: " + signUpError.message);
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      alert("No se pudo obtener el ID del usuario.");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert([
      { id: userId, username: username.trim() },
    ]);

    if (profileError) {
      alert("Error al crear el perfil: " + profileError.message);
      return;
    }

    alert("Registro exitoso. Revisa tu correo para confirmar tu cuenta.");
    router.push("/auth/login");
  };

  const passwordsMatch = password === repeatPassword;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar a la izquierda */}
      <Sidebar />

      {/* Área principal con formulario */}
      <main className="flex-grow flex items-center justify-center px-4 bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Crear cuenta</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="repeatPassword">Repetir contraseña</Label>
              <Input
                id="repeatPassword"
                type="password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                required
              />
              {!passwordsMatch && (
                <p className="text-red-600 text-sm mt-1">Las contraseñas no coinciden</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-blue-500 text-white hover:bg-blue-600" disabled={!passwordsMatch || !username.trim()}>
              Registrarse
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <a href="/auth/login" className="text-blue-500 hover:underline">
              Inicia sesión
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}