"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { FiabilidadBar } from "@/components/FiabilidadBar";

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
  verified_faults: number;
  reliability_score: number;
}

const PRIOR_SCORE = 0.95;
const PRIOR_COUNT = 5;

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
              verified_faults: 0,
              reliability_score: 0,
            };
          }

          summary[key].vehicle_count += 1;

          const verifiedFaults = vehicle.fault_reports.filter(f => f.is_verified).length;
          summary[key].verified_faults += verifiedFaults;
        }

        const modelsArray = Object.values(summary).map((item) => {
          const { vehicle_count, verified_faults } = item;

          const reliability_score =
            (PRIOR_COUNT * PRIOR_SCORE + (vehicle_count - verified_faults)) /
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

              <FiabilidadBar value={percentage} />

              <p className="text-xs text-gray-500">
                {m.verified_faults} avería(s) verificadas entre {m.vehicle_count} vehículo(s)
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
