import React from "react";
import { useNavigate } from "@remix-run/react";

export default function HomeItem(p: {
  icon: JSX.Element;
  title: string;
  to: string;
}) {
  const navigate = useNavigate();

  return (
    <div
      className="group flex flex-col items-center bg-white border rounded-2xl cursor-pointer max-w-xs p-8 shadow justify-center"
      onClick={() => navigate(p.to)}
    >
      {React.cloneElement(p.icon, {
        className:
          "h-14 text-gray-400 group-hover:text-primary transition-transform group-hover:transform group-hover:scale-110",
      })}
      <div className="text-slate-800 mt-4 group-hover:font-medium">
        {p.title}
      </div>
    </div>
  );
}
