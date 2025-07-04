import { Progress } from "@/components/ui/progress";

export const FiabilidadBar = ({
                                value,
                                evaluado,
                              }: {
  value: number;
  evaluado: boolean;
}) => {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">
        {evaluado ? `Fiabilidad: ${value.toFixed(0)}%` : "Sin datos suficientes"}
      </p>
      <Progress
        value={evaluado ? value : 0}
        className={evaluado ? "" : "bg-gray-200"}
        indicatorClassName={
          evaluado
            ? value >= 100
              ? "bg-[#83bf4f]"
              : value >= 80
                ? "bg-green-500"
                : value >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500"
            : "bg-gray-300"
        }
      />
    </div>
  );
};
