"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface ModelReliability {
  brand: string;
  model: string;
  vehicle_count: number;
  verified_faults: number;
  reliability_score: number;
}

export default function TopReliableVehicles() {
  const [models, setModels] = useState<ModelReliability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchData = async () => {
      const { data, error } = await supabase
        .from("vehicle_model_reliability")
        .select("*")
        .order("reliability_score", { ascending: false });

      if (!error && data) setModels(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p>Cargando datos de fiabilidad...</p>;

  if (models.length === 0)
    return <p>No hay modelos con datos suficientes para mostrar fiabilidad.</p>;

  return (
    <div className="grid gap-6">
      {models.map((m, index) => (
        <Card key={`${m.brand}-${m.model}-${index}`} className="p-4">
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span>
                {m.brand} {m.model}
              </span>
              <span>{Math.round(m.reliability_score * 100)}%</span>
            </div>
            <Progress value={m.reliability_score * 100} />
            <p className="text-xs text-gray-500">
              {m.verified_faults} avería(s) verificadas entre {m.vehicle_count} vehículo(s)
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
