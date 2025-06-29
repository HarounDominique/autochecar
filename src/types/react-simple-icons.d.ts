declare module "react-simple-icons" {
  import * as React from "react";

  export interface SimpleIconProps extends React.SVGProps<SVGSVGElement> {
    name: string;
    size?: number | string;
    color?: string;
  }

  export const SimpleIcon: React.FC<SimpleIconProps>;
}