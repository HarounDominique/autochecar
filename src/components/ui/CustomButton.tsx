"use client";

import React from "react";

type ButtonProps = {
  text: string;
  variant?: "primary" | "danger" | "secondary";
  onClick?: () => void;
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
    "px-4 py-2 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-[#007BFF] text-white hover:bg-[#006ae6] focus:ring-[#007BFF]",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
  };

  const handleClick = () => {
    if (variant === "danger") {
      const confirmed = confirm("¿Estás seguro de que deseas realizar esta acción?");
      if (!confirmed) return;
    }
    onClick?.();
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
