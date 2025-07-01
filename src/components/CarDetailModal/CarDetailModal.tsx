"use client";

import { useState } from "react";
import { Vehicle } from "@/types/vehicle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CarDetailModalProps {
  vehicle: Vehicle;
  open: boolean;
  onClose: () => void;
  onDelete?: (deletedId: string) => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({
                                                                vehicle,
                                                                open,
                                                                onClose,
                                                                onDelete,
                                                              }) => {
  const [deleting, setDeleting] = useState(false);
  const supabase = createClient();

  const handleDelete = async () => {
    const confirmed = confirm(
      "¿Estás seguro de que deseas eliminar este vehículo? Esta acción no se puede deshacer."
    );
    if (!confirmed) return;

    setDeleting(true);

    try {
      const { error } = await supabase
        .from("vehicles") // 🛑 asegúrate de que la tabla se llama así
        .delete()
        .eq("id", vehicle.id);

      if (error) {
        console.error("Error al eliminar vehículo:", error.message);
        alert("Hubo un error al eliminar el vehículo.");
      } else {
        alert("Vehículo eliminado correctamente.");
        onClose(); // Cierra el modal después de eliminar
        onDelete?.(vehicle.id); // ✅ Informa al padre
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      alert("Ha ocurrido un error inesperado.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[80vw] h-[80vh] max-w-4xl overflow-y-auto rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center text-2xl">
            Detalles del vehículo
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={deleting}>
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600 hover:bg-red-50"
                >
                  Eliminar vehículo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm text-gray-800">
          <div><strong>Tipo:</strong> {vehicle.type === "car" ? "Coche" : "Moto"}</div>
          <div><strong>Marca:</strong> {vehicle.brand}</div>
          <div><strong>Modelo:</strong> {vehicle.model}</div>
          <div><strong>Año:</strong> {vehicle.year}</div>
          <div><strong>Cilindrada:</strong> {vehicle.displacement} cc</div>
          <div><strong>Potencia:</strong> {vehicle.power} CV</div>
          <div><strong>Combustible:</strong> {vehicle.fuel}</div>
          <div><strong>Transmisión:</strong> {vehicle.transmission}</div>
          <div><strong>Fecha de alta:</strong> {new Date(vehicle.created_at).toLocaleDateString()}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
