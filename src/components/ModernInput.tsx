import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import "./modern-input.css";

interface ModernInputProps {
  label: string;
  type?: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  minLength?: number;
}

export const ModernInput: React.FC<ModernInputProps> = ({
  label,
  type = "text",
  icon,
  value,
  onChange,
  required = false,
  minLength = 6,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="mi-container">
      <div className="mi-icon">{icon}</div>

      <input
        type={isPassword && showPassword ? "text" : type}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        className="mi-input"
        placeholder=" "
      />

      <label className="mi-label">{label}</label>

      {isPassword && (
        <button
          type="button"
          className="mi-eye"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeSlashIcon className="mi-eye-icon" />
          ) : (
            <EyeIcon className="mi-eye-icon" />
          )}
        </button>
      )}
    </div>
  );
};
