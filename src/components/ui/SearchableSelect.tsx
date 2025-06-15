"use client";

import { useState, useEffect, useRef } from "react";

interface SearchableSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function SearchableSelect({
                                           label,
                                           options,
                                           value,
                                           onChange,
                                           required = false,
                                         }: SearchableSelectProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showList, setShowList] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Actualiza inputValue si cambia value desde afuera
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filtrar opciones según inputValue
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Detectar click fuera para cerrar lista
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowList(false);
        setInputValue(value); // reset al valor seleccionado al cerrar
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  // Seleccionar opción
  const selectOption = (opt: string) => {
    onChange(opt);
    setShowList(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label htmlFor={label} className="block mb-1 font-semibold">
        {label}
      </label>
      <input
        id={label}
        type="text"
        className="w-full border px-3 py-2 rounded-md"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowList(true);
        }}
        onFocus={() => setShowList(true)}
        required={required}
        autoComplete="off"
      />
      {showList && filteredOptions.length > 0 && (
        <ul className="absolute z-20 max-h-48 w-full overflow-auto rounded border bg-white shadow-lg">
          {filteredOptions.map((opt) => (
            <li
              key={opt}
              className="cursor-pointer px-4 py-2 hover:bg-blue-500 hover:text-white"
              onClick={() => selectOption(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
