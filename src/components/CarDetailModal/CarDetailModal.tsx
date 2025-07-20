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
import { categoryIconMap } from "@/components/CATEGORY_ICONS";

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
    if (!vehicle) return;

    const fetchData = async () => {
      // 1. Cargar categorías
      const { data: categoryData, error: categoryError } = await supabase
        .from("fault_categories")
        .select("id, name");

      if (categoryError || !categoryData) return;

      setCategories(categoryData);

      // 2. Cargar fallas del vehículo actual
      const { data: faultsData, error: faultsError } = await supabase
        .from("fault_reports")
        .select("category_id")
        .eq("vehicle_id", vehicle.id)
        .eq("is_verified", true);

      if (faultsError || !faultsData) return;

      // 3. Contar por categoría
      const counts: Record<number, number> = {};
      for (const row of faultsData) {
        if (row.category_id) {
          counts[row.category_id] = (counts[row.category_id] || 0) + 1;
        }
      }

      // 4. Calcular fiabilidad bayesiana
      const PRIOR_SCORE = 0.95;
      const PRIOR_COUNT = 5;

      const result: Record<number, number> = {};
      for (const cat of categoryData) {
        const n = counts[cat.id] || 0;
        const score = (PRIOR_SCORE * PRIOR_COUNT + 0 * n) / (PRIOR_COUNT + n);
        result[cat.id] = parseFloat(score.toFixed(3));
      }

      setCategoryReliability(result);
    };

    fetchData();
  }, [vehicle]);

  const fetchFaultReliability = async () => {
    const { data, error } = await supabase
      .from("fault_reports")
      .select("category_id")
      .eq("vehicle_id", vehicle.id)
      .eq("knows_origin", true)
      .eq("is_verified", true);

    if (error || !data) return;

    // Contamos averías por categoría
    const counts: Record<number, number> = {};
    for (const fault of data) {
      if (fault.category_id) {
        counts[fault.category_id] = (counts[fault.category_id] || 0) + 1;
      }
    }

    const PRIOR_SCORE = 0.95;
    const PRIOR_COUNT = 5;

    const result: Record<number, number> = {};
    for (const [catIdStr, faultCount] of Object.entries(counts)) {
      const catId = Number(catIdStr);
      const total = faultCount + PRIOR_COUNT;
      const score = (PRIOR_SCORE * PRIOR_COUNT) / total;
      result[catId] = parseFloat(score.toFixed(3));
    }

    // Las categorías sin averías explícitas se consideran perfectas
    for (const [name, Icon] of Object.entries(categoryIconMap)) {
      const id = categories.find((c) => c.name === name)?.id;
      if (id && !(id in result)) {
        result[id] = 1.0;
      }
    }

    setCategoryReliability(result);
  };

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

  const [categoryReliability, setCategoryReliability] = useState<Record<number, number>>({});

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

            <TabsContent value="fiabilidad" className="p-4 bg-white border rounded-b-md h-full flex flex-row gap-x-4">
              {/* Columna iconos */}
              <div className="flex-1 max-h-[60vh] overflow-y-auto border-r border-gray-200 pr-4">
                <div className="grid grid-cols-5 gap-4 mt-4">
                  {Object.entries(categoryIconMap).map(([name, IconFn]) => {
                    // Encontramos la categoría por nombre
                    const category = categories.find((c) => c.name === name);
                    // Obtenemos la fiabilidad de esa categoría
                    const reliability = category ? categoryReliability[category.id] : null;

                    // Asignamos color según fiabilidad
                    let iconColor = "text-gray-400";
                    if (reliability !== undefined && reliability !== null) {
                      if (reliability >= 0.95) iconColor = "text-green-500";
                      else if (reliability >= 0.85) iconColor = "text-yellow-500";
                      else iconColor = "text-red-500";
                    }

                    return (
                      <div
                        key={name}
                        className="w-full max-w-[110px] h-[100px] flex flex-col items-center justify-center p-2 border rounded-lg shadow-sm bg-white hover:bg-gray-50 transition"
                      >
                        <div className="w-6 h-6">
                          {IconFn(iconColor)} {/* <-- Aquí se pasa la clase como argumento */}
                        </div>
                        <span className="mt-2 text-[11px] text-center leading-tight">{name}</span>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Columna piechart */}
              <div className="flex-1 flex items-center justify-center max-h-[60vh]">
                <FaultsPieChart vehicleId={vehicle.id} showOnlyChart />
              </div>
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
