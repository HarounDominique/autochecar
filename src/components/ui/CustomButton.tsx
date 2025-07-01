"use client";

import React from "react";

type ButtonProps = {
  text: string;
  variant?: "primary" | "danger" | "secondary";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset"; // ✅ soporte para formularios
  className?: string;
};

export default function CustomButton({
                                       text,
                                       variant = "primary",
                                       onClick,
                                       type = "button",
                                       className = "",
                                     }: ButtonProps) {
  const baseStyle =
    "w-full px-4 py-2 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-[#83bf4f] text-white hover:bg-[#74a843] focus:ring-[#83bf4f] border border-transparent",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === "danger") {
      const confirmed = confirm("¿Estás seguro de que deseas realizar esta acción?");
      if (!confirmed) return;
    }
    onClick?.(e);
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {text}
    </button>
  );
}
