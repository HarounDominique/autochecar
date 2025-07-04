"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  fault_reports: Array<{ id: number; is_verified: boolean }>;
}

interface ModelReliability {
  brand: string;
  model: string;
  vehicle_count: number;
  affected_vehicles: number;
  reliability_score: number;
}

const MIN_VEHICLES_FOR_CONFIDENCE = 3;
const PRIOR_SCORE = 0.95; // Asumimos alta fiabilidad por defecto
const PRIOR_COUNT = 5; // Cuánto peso damos a esa suposición

export default function TopReliableVehicles() {
  const [models, setModels] = useState<ModelReliability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchVehicles = async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select(`
          id,
          brand,
          model,
          fault_reports (
            id,
            is_verified
          )
        `);

      if (error) {
        console.error("Error fetching vehicles:", error);
        setLoading(false);
        return;
      }

      if (data) {
        const summary: Record<string, ModelReliability> = {};

        for (const vehicle of data) {
          const key = `${vehicle.brand}-${vehicle.model}`;

          if (!summary[key]) {
            summary[key] = {
              brand: vehicle.brand,
              model: vehicle.model,
              vehicle_count: 0,
              affected_vehicles: 0,
              reliability_score: 0,
            };
          }

          summary[key].vehicle_count += 1;

          const hasVerifiedFault = vehicle.fault_reports.some(
            (fault) => fault.is_verified
          );

          if (hasVerifiedFault) {
            summary[key].affected_vehicles += 1;
          }
        }

        const modelsArray = Object.values(summary).map((item) => {
          const { vehicle_count, affected_vehicles } = item;

          const non_faulty = vehicle_count - affected_vehicles;

          const reliability_score =
            (PRIOR_COUNT * PRIOR_SCORE + non_faulty) /
            (vehicle_count + PRIOR_COUNT);

          return {
            ...item,
            reliability_score,
          };
        });

        modelsArray.sort((a, b) => b.reliability_score - a.reliability_score);

        setModels(modelsArray);
      }

      setLoading(false);
    };

    fetchVehicles();
  }, []);

  if (loading) return <p>Cargando datos de fiabilidad...</p>;

  if (models.length === 0)
    return <p>No hay modelos con datos para mostrar fiabilidad.</p>;

  return (
    <div className="grid gap-6">
      {models.map((m, index) => {
        const hasFewVehicles = m.vehicle_count < MIN_VEHICLES_FOR_CONFIDENCE;
        const percentage = Math.round(m.reliability_score * 100);

        return (
          <Card key={`${m.brand}-${m.model}-${index}`} className="p-4">
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>
                  {m.brand} {m.model}
                </span>
                <span>{percentage}%</span>
              </div>

              <Progress
                value={percentage}
                className="bg-gray-200"
                indicatorClassName={
                  percentage >= 90
                    ? "bg-[#83bf4f]"
                    : percentage >= 70
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }
              />

              <p className="text-xs text-gray-500">
                {m.affected_vehicles} de {m.vehicle_count} vehículo(s) con al menos una avería verificada
              </p>

              {hasFewVehicles && (
                <p className="text-xs text-yellow-700 font-medium">
                  * Datos limitados — fiabilidad orientativa
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
