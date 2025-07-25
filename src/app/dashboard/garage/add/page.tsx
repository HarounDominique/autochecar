"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomButton from "@/components/ui/CustomButton";

export default function AddVehiclePage() {
  const [vehicleType, setVehicleType] = useState("car");
  const [brand, setBrand] = useState("");
  const [showBrandList, setShowBrandList] = useState(false);
  const [model, setModel] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [year, setYear] = useState("");
  const [cc, setCc] = useState("");
  const [power, setPower] = useState("");
  const [fuel, setFuel] = useState("gasoline");
  const [transmission, setTransmission] = useState("manual");

  const [brandModelData, setBrandModelData] = useState<{ brand: string; models: string[] }[]>([]);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/data/brandAndModel.json");
      const data = await res.json();
      setBrandModelData(data);
    }
    fetchData();
  }, []);

  const filteredBrands =
    brand.trim().length === 0
      ? []
      : brandModelData
        .map((b) => b.brand)
        .filter((name) =>
          name.toLowerCase().startsWith(brand.toLowerCase())
        );

  const selectBrand = (name: string) => {
    setBrand(name);
    setShowBrandList(false);
    const selected = brandModelData.find((b) => b.brand === name);
    if (selected) {
      setModels(selected.models.sort((a, b) => a.localeCompare(b)));
    } else {
      setModels([]);
    }
    setModel("");
    setYear("");
  };

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowBrandList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      alert("No estás autenticado");
      return;
    }

    const { error } = await supabase.from("vehicles").insert([
      {
        user_id: user.id,
        type: vehicleType,
        brand,
        model,
        year: parseInt(year),
        displacement: parseInt(cc),
        power: parseInt(power),
        fuel,
        transmission,
      },
    ]);

    if (error) {
      console.error("Error al guardar el vehículo:", error.message);
      alert("Error al guardar vehículo");
    } else {
      router.push("/dashboard/garage");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Añadir vehículo</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="type">Tipo de vehículo</Label>
          <select
            id="type"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="car">Coche</option>
            <option value="motorcycle">Moto</option>
          </select>
        </div>

        <div ref={containerRef}>
          <Label htmlFor="brand">Marca</Label>
          <input
            type="text"
            id="brand"
            className="w-full border px-3 py-2 rounded-md"
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              setShowBrandList(true);
            }}
            autoComplete="off"
            required
          />
          {showBrandList && filteredBrands.length > 0 && (
            <ul className="border rounded-md mt-1 bg-white max-h-48 overflow-y-auto shadow">
              {filteredBrands.map((b, i) => (
                <li
                  key={i}
                  onClick={() => selectBrand(b)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <Label htmlFor="model">Modelo</Label>
          <select
            id="model"
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              setYear("");
            }}
            className="w-full border px-3 py-2 rounded-md"
            required
            disabled={models.length === 0}
          >
            <option value="">Selecciona un modelo</option>
            {models.map((m, i) => (
              <option key={i} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="year">Año</Label>
          <Input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="cc">Cilindrada (cc)</Label>
          <Input
            id="cc"
            type="number"
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="power">Potencia (CV)</Label>
          <Input
            id="power"
            type="number"
            value={power}
            onChange={(e) => setPower(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="fuel">Combustible</Label>
          <select
            id="fuel"
            value={fuel}
            onChange={(e) => setFuel(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="gasoline">Gasolina</option>
            <option value="diesel">Diésel</option>
            <option value="electric">Eléctrico</option>
            <option value="hybrid">Híbrido</option>
            <option value="LPG">GLP</option>
            <option value="CNG">GNC</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <div>
          <Label htmlFor="transmission">Cambio</Label>
          <select
            id="transmission"
            value={transmission}
            onChange={(e) => setTransmission(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="manual">Manual</option>
            <option value="automatic">Automático</option>
            <option value="semi-automatic">Semiautomático</option>
            <option value="CVT">CVT</option>
          </select>
        </div>

        <CustomButton type="submit" text="Guardar vehículo" variant="primary" />
      </form>
    </div>
  );
}
