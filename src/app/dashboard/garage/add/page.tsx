"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomButton from "@/components/ui/CustomButton";
import SearchableSelect from "@/components/ui/SearchableSelect";

export default function AddVehiclePage() {
  const [vehicleType, setVehicleType] = useState("car");

  // Marcas, modelos y demás
  const [brands, setBrands] = useState<string[]>([]);
  const [brand, setBrand] = useState("");
  const [showBrandList, setShowBrandList] = useState(false);

  // ... otros estados
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [cc, setCc] = useState("");
  const [power, setPower] = useState("");
  const [fuel, setFuel] = useState("gasoline");
  const [transmission, setTransmission] = useState("manual");
  const router = useRouter();
  const supabase = createClient();

  // Fetch marcas al montar el componente
  useEffect(() => {
    fetch("https://www.carqueryapi.com/api/0.3/?cmd=getMakes")
      .then(res => res.text()) // Recibimos JSONP (texto)
      .then(text => {
        // La respuesta es JSONP, por ejemplo: callback({...})
        // Extraemos el objeto JSON
        const jsonStr = text.replace(/^callback\((.*)\);?$/, "$1");
        const data = JSON.parse(jsonStr);
        // data.Makes es el array con las marcas
        const brandNames = data.Makes.map((make: any) => make.make_display);
        setBrands(brandNames.sort());
      })
      .catch(console.error);
  }, []);

  // Filtrar marcas según lo que escribe el usuario (ignorando mayúsculas/minúsculas)
  const filteredBrands = brands.filter(b =>
    b.toLowerCase().includes(brand.toLowerCase())
  );

  // Manejo selección marca
  const selectBrand = (name: string) => {
    setBrand(name);
    setShowBrandList(false);
  };

  // Ocultar lista si haces click fuera
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

        {/* Marca con autocompletado */}
        <SearchableSelect
          label="Marca"
          options={brands}
          value={brand}
          onChange={setBrand}
          required
        />

        {/* De momento modelos, año, cilindrada, etc. igual que antes */}

        <div>
          <Label htmlFor="model">Modelo</Label>
          <Input
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
          />
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
