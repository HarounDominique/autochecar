"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const HeroSection = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("Error logging in:", error.message);
    } else {
      router.push("/dashboard");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== repeatPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.error("Error registering:", error.message);
    } else {
      router.push("/dashboard");
    }
  };

  const passwordsMatch = password === repeatPassword;

  return (
    <div className="bg-[#212121] mt-6 min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
          {isLogin ? "Iniciar sesión" : "Regístrate"}
        </h2>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
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

          {!isLogin && (
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
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!isLogin && !passwordsMatch} // deshabilitar si en registro y no coinciden
          >
            {isLogin ? "Entrar" : "Crear cuenta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? (
            <>
              ¿No tienes cuenta?{" "}
              <button
                onClick={() => {
                  setIsLogin(false);
                  setPassword("");
                  setRepeatPassword("");
                }}
                className="text-blue-500 hover:underline"
                type="button"
              >
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <button
                onClick={() => {
                  setIsLogin(true);
                  setPassword("");
                  setRepeatPassword("");
                }}
                className="text-blue-500 hover:underline"
                type="button"
              >
                Inicia sesión
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
