import React from "react";

type SpinnerProps = {
  spinnerColor?: "blue" | "red";
};

const Spinner: React.FC<SpinnerProps> = ({ spinnerColor = "blue" }) => {
  const borderColor =
    spinnerColor === "red" ? "border-red-600" : "border-blue-500";

  return (
    <div className="flex items-center justify-center">
      <div
        className={`h-12 w-12 animate-spin rounded-full border-t-4 ${borderColor}`}
      ></div>
    </div>
  );
};

export default Spinner;
