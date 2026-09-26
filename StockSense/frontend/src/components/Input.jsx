import { forwardRef } from "react";

const Input = forwardRef(({ label, error, className = "", ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${error ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"} ${className}`}
        {...props}
      />
    </div>
  );
});

Input.displayName = "Input";

export default Input;
