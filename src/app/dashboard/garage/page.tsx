"use client";

import { useRouter } from "next/navigation";
import CustomButton from "@/components/ui/CustomButton";

export default function GaragePage() {
  const router = useRouter();

  const handleAddVehicle = () => {
    router.push("/dashboard/garage/add");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Mi Garaje</h1>
        <CustomButton text="Añadir vehículo" onClick={handleAddVehicle} />
      </div>

      <p className="text-gray-500 italic">*sonido de grillos*</p>
    </div>
  );
}
