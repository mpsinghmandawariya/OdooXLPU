const Button = ({
  children,
  type = "button",
  variant = "primary",
  className = "",
  ...props
}) => {
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-700",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
