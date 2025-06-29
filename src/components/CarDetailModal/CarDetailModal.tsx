"use client";

import { Vehicle } from "@/types/vehicle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface CarDetailModalProps {
  vehicle: Vehicle;
  open: boolean;
  onClose: () => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({ vehicle, open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[80vw] h-[80vh] max-w-4xl overflow-y-auto rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center text-2xl">
            Detalles del vehículo
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
