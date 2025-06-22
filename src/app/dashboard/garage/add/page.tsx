"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomButton from "@/components/ui/CustomButton";

type Brand = { id: number; name: string };
type Automobile = { id: number; brand_id: number; name: string };

export default function AddVehiclePage() {
  const [vehicleType, setVehicleType] = useState("car");

  const [brands, setBrands] = useState<Brand[]>([]);
  const [automobiles, setAutomobiles] = useState<Automobile[]>([]);

  const [brand, setBrand] = useState("");
  const [brandId, setBrandId] = useState<number | null>(null);
  const [showBrandList, setShowBrandList] = useState(false);

  const [model, setModel] = useState("");
  const [models, setModels] = useState<string[]>([]);

  const [year, setYear] = useState("");
  const [cc, setCc] = useState("");
  const [power, setPower] = useState("");
  const [fuel, setFuel] = useState("gasoline");
  const [transmission, setTransmission] = useState("manual");

  const router = useRouter();
  const supabase = createClient();

  type GroupedModel = {
    baseName: string;
    yearRanges: string[];
  };

  const [groupedModels, setGroupedModels] = useState<GroupedModel[]>([]);
  const [yearOptions, setYearOptions] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      const [brandRes, autoRes] = await Promise.all([
        fetch("/data/brands.json"),
        fetch("/data/automobiles.json"),
      ]);
      const brandData = await brandRes.json();
      const autoData = await autoRes.json();

      setBrands(brandData);
      setAutomobiles(autoData);
    }

    fetchData();
  }, []);

  const filteredBrands =
    brand.trim().length === 0
      ? []
      : brands
        .map((b) => b.name)
        .filter((name) =>
          name.toLowerCase().startsWith(brand.toLowerCase())
        );

  const selectBrand = (name: string) => {
    setBrand(name);
    setShowBrandList(false);

    const selected = brands.find((b) => b.name === name);
    if (!selected) {
      setBrandId(null);
      setGroupedModels([]);
      setModels([]);
      return;
    }

    setBrandId(selected.id);

    const cleanModelName = (
      rawName: string,
      brandName: string
    ): { base: string; yearRange: string | null } => {
      let name = rawName
        .replace(/<[^>]*>/g, "") // elimina etiquetas HTML
        .replace(/Photos.*$/i, "")
        .replace(/,?\s*engines.*$/i, "")
        .trim();

      const brandRegex = new RegExp(`^${brandName}\\s+`, "i");
      name = name.replace(brandRegex, "").trim();

      // Buscar año en cualquier parte, entre paréntesis o no
      const yearMatch = name.match(/(\d{4}-(?:\d{4}|present))/i);
      const yearRange = yearMatch ? yearMatch[1] : null;

      // Quitar paréntesis que contengan años
      name = name.replace(/\(?\d{4}-(?:\d{4}|present)\)?/gi, "").trim();

      // Quitar prefijos de año si están fuera de paréntesis
      name = name.replace(/^\d{4}\s*/, "").trim();

      return {
        base: name,
        yearRange,
      };
    };

    const modelMap: Record<string, Set<string>> = {};

    automobiles
      .filter((a) => a.brand_id === selected.id)
      .forEach((a) => {
        const { base, yearRange } = cleanModelName(a.name, selected.name);

        if (!modelMap[base]) {
          modelMap[base] = new Set();
        }
        if (yearRange) {
          modelMap[base].add(yearRange);
        }
      });

    const groupedList: GroupedModel[] = Object.entries(modelMap)
      .map(([baseName, yearRangeSet]) => ({
        baseName,
        yearRanges: Array.from(yearRangeSet).sort((a, b) => {
          const getStart = (range: string) =>
            parseInt(range.split("-")[0], 10);
          return getStart(a) - getStart(b);
        }),
      }))
      .sort((a, b) => a.baseName.localeCompare(b.baseName));

    setGroupedModels(groupedList);
    setModel("");
    setYear("");
    setYearOptions([]);
  };

  useEffect(() => {
    const selected = groupedModels.find((m) => m.baseName === model);
    if (selected) {
      setYearOptions(selected.yearRanges);
    } else {
      setYearOptions([]);
    }
  }, [model, groupedModels]);

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
            disabled={groupedModels.length === 0}
          >
            <option value="">Selecciona un modelo</option>
            {groupedModels.map((m, i) => (
              <option key={i} value={m.baseName}>
                {m.baseName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="year">Año</Label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
            required
            disabled={!model}
          >
            <option value="">Selecciona un rango</option>
            {yearOptions.map((range, i) => (
              <option key={i} value={range}>
                {range}
              </option>
            ))}
          </select>
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
