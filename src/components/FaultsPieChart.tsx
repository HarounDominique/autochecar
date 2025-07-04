"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { createClient } from "@/lib/supabase/client";

interface FaultsPieChartProps {
  vehicleId: string;
}

interface PieData {
  name: string;
  value: number;
}

const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1",
  "#a4de6c", "#d0ed57", "#d88884", "#c458ff", "#4dd0e1",
  "#ffb74d", "#81c784", "#ba68c8", "#e57373", "#90a4ae"
];

export const FaultsPieChart: React.FC<FaultsPieChartProps> = ({ vehicleId }) => {
  const [data, setData] = useState<PieData[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchFaultData = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("fault_reports")
        .select("category_id, fault_categories(name)")
        .eq("vehicle_id", vehicleId)
        .not("category_id", "is", null);

      if (error) {
        console.error("Error al obtener averías:", error.message);
        setLoading(false);
        return;
      }

      const counts: Record<string, number> = {};
      data.forEach((item: any) => {
        const name = item.fault_categories?.name || "Sin categoría";
        counts[name] = (counts[name] || 0) + 1;
      });

      const pieData = Object.entries(counts).map(([name, value]) => ({
        name,
        value,
      }));

      setData(pieData);
      setLoading(false);
    };

    fetchFaultData();
  }, [vehicleId]);

  if (loading) return <p className="text-sm text-gray-500">Cargando gráfico...</p>;

  if (data.length === 0) return <p className="text-sm text-gray-500">No hay averías registradas por categoría.</p>;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
