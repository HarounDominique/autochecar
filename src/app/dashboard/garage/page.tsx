"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CustomButton from "@/components/ui/CustomButton";
import { FaCar, FaMotorcycle } from "react-icons/fa";
import * as simpleIcons from "simple-icons";

type Vehicle = {
  id: number;
  brand: string;
  model: string;
  year?: number;
  type: "car" | "motorcycle" | string;
};

function MarcaIcon({ brand }: { brand: string }) {
  if (!brand) return null;

  const iconEntry = Object.values(simpleIcons).find(
    (icon) =>
      typeof icon === "object" &&
      "title" in icon &&
      icon.title.toLowerCase() === brand.toLowerCase()
  );

  if (!iconEntry) {
    return <span className="text-gray-400 text-2xl">🚗</span>;
  }

  const { hex, svg, title } = iconEntry as {
    hex: string;
    svg: string;
    title: string;
  };

  const pathMatch = svg.match(/<path d="([^"]+)"\/>/);
  const pathData = pathMatch ? pathMatch[1] : "";

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={32}
      height={32}
      fill={`#${hex}`}
      className="flex-shrink-0"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={pathData} />
    </svg>
  );
}

export default function GaragePage() {
  const router = useRouter();
  const supabase = createClient();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error obteniendo usuario:", userError);
        setVehicles([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error obteniendo vehículos:", error);
        setVehicles([]);
      } else {
        setVehicles(data);
      }
      setLoading(false);
    };

    fetchVehicles();
  }, [supabase]);

  const handleAddVehicle = () => {
    router.push("/dashboard/garage/add");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Mi Garaje</h1>
        <CustomButton text="Añadir vehículo" onClick={handleAddVehicle} />
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando vehículos...</p>
      ) : vehicles.length === 0 ? (
        <p className="text-gray-500 italic">*sonido de grillos*</p>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="border rounded-lg shadow-sm bg-white flex flex-col items-center justify-center gap-4 p-6 aspect-square"
            >
              {v.type === "car" ? (
                <FaCar className="text-3xl text-blue-600" />
              ) : v.type === "motorcycle" ? (
                <FaMotorcycle className="text-3xl text-green-600" />
              ) : (
                <span className="text-gray-400 text-3xl">🚗</span>
              )}

              <MarcaIcon brand={v.brand} />

              <div className="text-center">
                <h2 className="text-lg font-semibold">
                  {v.brand} {v.model}
                </h2>
                {v.year && <p className="text-sm text-gray-600">Año: {v.year}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
