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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FaultsPieChart } from "@/components/FaultsPieChart";

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
        alert("Hubo un error al eliminar el vehículo.");
      } else {
        alert("Vehículo eliminado correctamente.");
        onClose();
        onDelete?.(vehicle.id);
      }
    } catch (err) {
      alert("Ha ocurrido un error inesperado: " + err);
    } finally {
      setDeleting(false);
    }
  };

  const handleAddFault = () => setOpenAddFaultModal(true);

  const handleSaveFault = async () => {
    if (knowsOrigin === null || faultDescription.trim() === "") {
      alert("Completa los campos requeridos.");
      return;
    }

    if (knowsOrigin && !selectedCategoryId) {
      alert("Selecciona una categoría de avería.");
      return;
    }

    setSavingFault(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Inicia sesión para continuar.");
        setSavingFault(false);
        return;
      }

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

      if (!error) {
        alert("Avería reportada con éxito.");
        setOpenAddFaultModal(false);
        setKnowsOrigin(null);
        setSelectedCategoryId(null);
        setPartDescription("");
        setFaultDescription("");
      }
    } catch {
      alert("Error al guardar la avería.");
    } finally {
      setSavingFault(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] h-[95vh] max-w-none max-h-none overflow-y-auto rounded-xl p-6">
          <Tabs defaultValue="info" className="w-full">
            <DialogHeader className="mb-4">
              <div className="flex justify-between items-center">
                <DialogTitle className="text-2xl font-semibold">
                  Detalles del vehículo
                </DialogTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={deleting} className="ml-4">
                      <MoreVertical className="w-6 h-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleAddFault}>Reportar avería</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600 hover:bg-red-50">
                      Eliminar vehículo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <TabsList className="mt-4 flex border-b border-gray-200">
                <TabsTrigger value="info">Ficha técnica</TabsTrigger>
                <TabsTrigger value="fiabilidad">Fiabilidad</TabsTrigger>
              </TabsList>
            </DialogHeader>

            <TabsContent value="info" className="border border-t-0 rounded-b-md p-4 bg-white shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
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
            </TabsContent>

            <TabsContent value="fiabilidad" className="p-4 bg-white border rounded-b-md">
              <FaultsPieChart vehicleId={vehicle.id} showOnlyChart />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

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
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}

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
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenAddFaultModal(false)} disabled={savingFault}>Cancelar</Button>
            <Button onClick={handleSaveFault} disabled={savingFault || knowsOrigin !== true}>{savingFault ? "Guardando..." : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
