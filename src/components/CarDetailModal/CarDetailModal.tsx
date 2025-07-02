"use client";

import { useState, useEffect } from "react";
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
  const [savingFault, setSavingFault] = useState(false);
  const [knowsOrigin, setKnowsOrigin] = useState<null | boolean>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [partDescription, setPartDescription] = useState("");
  const [faultDescription, setFaultDescription] = useState("");


  const supabase = createClient();

  useEffect(() => {
    if (openAddFaultModal && knowsOrigin === true) {
      fetchCategories();
    }
  }, [openAddFaultModal, knowsOrigin]);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("fault_categories").select("id, name");
    if (!error && data) setCategories(data);
  };

  const handleDelete = async () => {
    const confirmed = confirm(
      "¿Estás seguro de que deseas eliminar este vehículo? Esta acción no se puede deshacer."
    );
    if (!confirmed) return;

    setDeleting(true);

    try {
      const { error } = await supabase.from("vehicles").delete().eq("id", vehicle.id);

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
    if (knowsOrigin === null) {
      alert("Por favor, indica si conoces el origen de la avería.");
      return;
    }

    if (knowsOrigin === true && !selectedCategoryId) {
      alert("Por favor, selecciona una categoría de avería.");
      return;
    }

    if (faultDescription.trim() === "") {
      alert("Por favor, describe la avería.");
      return;
    }

    setSavingFault(true);

    try {
      // Obtener usuario actual
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("No se pudo identificar el usuario. Por favor, inicia sesión.");
        setSavingFault(false);
        return;
      }

      // Crear snapshot del vehículo
      const vehicleSnapshot = {
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        displacement: vehicle.displacement,
        power: vehicle.power,
        fuel: vehicle.fuel,
        transmission: vehicle.transmission,
        type: vehicle.type,
      };

      const { error } = await supabase.from("fault_reports").insert({
        vehicle_id: vehicle.id,
        user_id: user.id,
        knows_origin: knowsOrigin,
        category_id: knowsOrigin ? selectedCategoryId : null,
        part_description: partDescription.trim() || null,
        fault_description: faultDescription.trim(),
        vehicle_snapshot: vehicleSnapshot,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error al guardar avería:", error.message);
        alert("Error al guardar la avería.");
      } else {
        alert("Avería guardada correctamente.");
        // Reset form
        setOpenAddFaultModal(false);
        setKnowsOrigin(null);
        setSelectedCategoryId(null);
        setPartDescription("");
        setFaultDescription("");
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
                    Reportar avería
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
              <strong>Fecha de alta:</strong> {new Date(vehicle.created_at).toLocaleDateString()}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para añadir avería */}
      <Dialog open={openAddFaultModal} onOpenChange={setOpenAddFaultModal}>
        <DialogContent className="w-[80vw] h-[80vh] max-w-4xl overflow-y-auto rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>Reportar avería para {vehicle.brand} {vehicle.model}</DialogTitle>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            <p className="font-semibold">¿Conoces el origen de la avería?</p>
            <div className="flex gap-4">
              <Button variant={knowsOrigin === true ? "default" : "outline"} onClick={() => setKnowsOrigin(true)}>Sí</Button>
              <Button variant={knowsOrigin === false ? "default" : "outline"} onClick={() => setKnowsOrigin(false)}>No</Button>
            </div>

            {knowsOrigin === true && (
              <div className="mt-4">
                <label className="block font-semibold mb-2">Sistema afectado</label>
                <select
                  className="w-full border rounded-md p-2"
                  value={selectedCategoryId || ""}
                  onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {knowsOrigin !== null && (
            <>
              <div className="mt-4">
                <label className="block font-semibold mb-2">Descripción de la pieza(s) afectada(s)</label>
                <input
                  type="text"
                  className="w-full border rounded-md p-2"
                  value={partDescription}
                  onChange={(e) => setPartDescription(e.target.value)}
                  placeholder="Describe la(s) pieza(s) afectada(s)"
                  disabled={savingFault}
                />
              </div>

              <div className="mt-4">
                <label className="block font-semibold mb-2">Descripción de la avería</label>
                <textarea
                  rows={4}
                  className="w-full border rounded-md p-2 resize-none"
                  value={faultDescription}
                  onChange={(e) => setFaultDescription(e.target.value)}
                  placeholder="Describe la avería o fallo..."
                  disabled={savingFault}
                />
              </div>
            </>
          )}

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpenAddFaultModal(false)}
              disabled={savingFault}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveFault} disabled={savingFault || knowsOrigin !== true}>
              {savingFault ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
