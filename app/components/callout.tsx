import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

export default function Callout(p: {
  text: string;
  intent: "danger" | "warning" | "success";
}) {
  return (
    <div className="bg-red-50 text-gray-800 rounded mt-2 font-medium  px-3 py-3 flex items-center">
      <ExclamationCircleIcon className="h-6 mr-2 text-red-500" /> {p.text}
    </div>
  );
}
