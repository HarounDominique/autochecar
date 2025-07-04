import { Progress } from "@/components/ui/progress";

export const FiabilidadBar = ({
                                value,
                              }: {
  value: number;
}) => {
  const getColor = () => {
    if (value >= 95) return "bg-[#83bf4f]";        // verde premium
    if (value >= 90) return "bg-green-500";        // verde fuerte
    if (value >= 85) return "bg-lime-400";         // verde lima
    if (value >= 75) return "bg-yellow-300";       // amarillo
    if (value >= 65) return "bg-amber-400";        // ámbar
    if (value >= 50) return "bg-orange-400";       // naranja
    return "bg-red-500";                           // rojo
  };

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">Fiabilidad: {value.toFixed(0)}%</p>
      <Progress
        value={value}
        className="bg-gray-200"
        indicatorClassName={getColor()}
      />
    </div>
  );
};
