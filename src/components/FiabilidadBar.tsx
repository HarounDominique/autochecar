import { Progress } from "@/components/ui/progress";

export const FiabilidadBar = ({
                                value,
                              }: {
  value: number;
}) => {
  const getColor = () => {
    if (value >= 90) return "bg-[#83bf4f]";
    if (value >= 80) return "bg-green-500";
    if (value >= 70) return "bg-[#e6e94a]";
    if (value >= 60) return "bg-amber-400";
    if (value >= 50) return "bg-orange-400";
    return "bg-red-500";
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
