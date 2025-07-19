import {
  SettingsIcon,
  RouteIcon,
  DiscIcon,
  WavesIcon,
  CircleGaugeIcon,
  GanttChartIcon,

  ZapIcon,
  RadarIcon,
  ThermometerIcon,
  FanIcon,
  PanelTopIcon,
  LandmarkIcon,
  CarIcon,
  PlugIcon,
} from "lucide-react";

export const categoryIconMap: Record<string, JSX.Element> = {
  "Motor": <SettingsIcon className="w-6 h-6" />,
  "Transmisión / Cambio": <RouteIcon className="w-6 h-6" />,
  "Embrague": <DiscIcon className="w-6 h-6" />,
  "Escape": <WavesIcon className="w-6 h-6" />,
  "Frenos": <CircleGaugeIcon className="w-6 h-6" />,
  "Suspensión": <GanttChartIcon className="w-6 h-6" />,
  //"Dirección": <SteeringWheelIcon className="w-6 h-6" />,
  "Sistema eléctrico": <ZapIcon className="w-6 h-6" />,
  "Electrónica / ECU": <RadarIcon className="w-6 h-6" />,
  "Refrigeración": <ThermometerIcon className="w-6 h-6" />,
  "Alimentación / Combustible": <PlugIcon className="w-6 h-6" />, // temporal
  "Admisión / Aire": <FanIcon className="w-6 h-6" />,
  "Interior": <PanelTopIcon className="w-6 h-6" />,
  "Exterior / Carrocería": <LandmarkIcon className="w-6 h-6" />,
  "Neumáticos / Ruedas": <CarIcon className="w-6 h-6" />,
};
