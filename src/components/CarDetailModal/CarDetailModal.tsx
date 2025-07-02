"use client";

import { useState } from "react";
import { Vehicle } from "@/types/vehicle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  const [openAddFaultModal, setOpenAddFaultModal] = useState(false);
  const [faultDescription, setFaultDescription] = useState("");
  const [savingFault, setSavingFault] = useState(false);

  const supabase = createClient();

  const handleDelete = async () => {
    const confirmed = confirm(
      "¿Estás seguro de que deseas eliminar este vehículo? Esta acción no se puede deshacer."
    );
    if (!confirmed) return;

    setDeleting(true);

    try {
      const { error } = await supabase
        .from("vehicles")
        .delete()
        .eq("id", vehicle.id);

      if (error) {
        console.error("Error al eliminar vehículo:", error.message);
        alert("Hubo un error al eliminar el vehículo.");
      } else {
        alert("Vehículo eliminado correctamente.");
        onClose();
        onDelete?.(vehicle.id);
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      alert("Ha ocurrido un error inesperado.");
    } finally {
      setDeleting(false);
    }
  };

  const handleAddFault = () => {
    setOpenAddFaultModal(true);
  };

  const handleSaveFault = async () => {
    if (faultDescription.trim() === "") {
      alert("Por favor, describe la avería.");
      return;
    }

    setSavingFault(true);

    try {
      const { error } = await supabase.from("faults").insert({
        vehicle_id: vehicle.id,
        description: faultDescription.trim(),
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error al guardar avería:", error.message);
        alert("Error al guardar la avería.");
      } else {
        alert("Avería guardada correctamente.");
        setFaultDescription("");
        setOpenAddFaultModal(false);
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      alert("Error inesperado al guardar la avería.");
    } finally {
      setSavingFault(false);
    }
  };

  return (
    <>
      {/* Modal principal */}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-[80vw] h-[80vh] max-w-4xl overflow-y-auto rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center text-2xl">
              Detalles del vehículo
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deleting}
                    className="ml-4"
                  >
                    <MoreVertical className="w-6 h-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleAddFault}>
                    Añadir avería
                  </DropdownMenuItem>
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
            <div>
              <strong>Tipo:</strong> {vehicle.type === "car" ? "Coche" : "Moto"}
            </div>
            <div>
              <strong>Marca:</strong> {vehicle.brand}
            </div>
            <div>
              <strong>Modelo:</strong> {vehicle.model}
            </div>
            <div>
              <strong>Año:</strong> {vehicle.year}
            </div>
            <div>
              <strong>Cilindrada:</strong> {vehicle.displacement} cc
            </div>
            <div>
              <strong>Potencia:</strong> {vehicle.power} CV
            </div>
            <div>
              <strong>Combustible:</strong> {vehicle.fuel}
            </div>
            <div>
              <strong>Transmisión:</strong> {vehicle.transmission}
            </div>
            <div>
              <strong>Fecha de alta:</strong>{" "}
              {new Date(vehicle.created_at).toLocaleDateString()}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para añadir avería */}
      <Dialog open={openAddFaultModal} onOpenChange={setOpenAddFaultModal}>
        <DialogContent className="w-[80vw] h-[80vh] max-w-4xl overflow-y-auto rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>Añadir avería para {vehicle.brand} {vehicle.model}</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <label htmlFor="faultDescription" className="block font-semibold mb-2">
              Descripción de la avería
            </label>
            <textarea
              id="faultDescription"
              rows={6}
              className="w-full border rounded-md p-2 resize-none"
              value={faultDescription}
              onChange={(e) => setFaultDescription(e.target.value)}
              placeholder="Describe la avería o fallo..."
              disabled={savingFault}
            />
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpenAddFaultModal(false)}
              disabled={savingFault}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveFault} disabled={savingFault}>
              {savingFault ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
