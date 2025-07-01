"use client";

import Link from "next/link";
import { Zap, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getGitHubStars } from "@/utils/github";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [stars, setStars] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const repo = "idee8/shipfree";

  useEffect(() => {
    getGitHubStars(repo).then(setStars);
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const formatStars = (count: number): string => {
    return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString();
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-[#212121]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-10 w-10" fill="#FFBE18" stroke="black" strokeWidth={1.4} />
            <span className="text-lg font-semibold text-white">ShipFree</span>
          </Link>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="#pricing" className="text-base text-white/90 transition hover:text-white">Pricing</Link>
          <Link href="#faq" className="text-base text-white/90 transition hover:text-white">FAQ</Link>
          <Link href="#wall-of-love" className="text-base text-white/90 transition hover:text-white">Wall of love</Link>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              <span className="text-white text-sm">Hola, {user.email}</span>
              <Button variant="outline" onClick={handleLogout}>Cerrar sesión</Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-white border border-white hover:bg-white hover:text-black">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-yellow-400 text-black hover:bg-yellow-300">
                  Registrarse
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex md:hidden">
          <button onClick={toggleMenu} className="inline-flex items-center justify-center rounded-md p-2 text-white/90 hover:text-white">
            <span className="sr-only">Toggle menu</span>
            {isMenuOpen ? <X className="h-6 w-6" /> : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#212121] px-4 pt-2 pb-4 space-y-2">
          <Link href="#pricing" onClick={toggleMenu} className="block text-white hover:text-yellow-300">Pricing</Link>
          <Link href="#faq" onClick={toggleMenu} className="block text-white hover:text-yellow-300">FAQ</Link>
          <Link href="#wall-of-love" onClick={toggleMenu} className="block text-white hover:text-yellow-300">Wall of love</Link>
          <a href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer" className="block text-white hover:text-yellow-300">
            Star us on GitHub {stars !== null && `(${formatStars(stars)})`}
          </a>

          {user ? (
            <>
              <p className="text-white mt-2">Hola, {user.email}</p>
              <button onClick={handleLogout} className="w-full text-left text-white hover:text-red-400 mt-1">Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={toggleMenu} className="block text-white hover:text-green-400 mt-2">Iniciar sesión</Link>
              <Link href="/register" onClick={toggleMenu} className="block text-white hover:text-blue-400">Registrarse</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
