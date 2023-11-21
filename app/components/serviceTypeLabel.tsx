import { AcademicCapIcon, BeakerIcon, ServerStackIcon } from "@heroicons/react/24/solid";
import { ServiceType } from "@prisma/client";
import className from 'classnames';

export default function ServiceTypeLabel(p: { type: ServiceType }) {
  switch (p.type) {
    case "VISIT":
      return 'Visita Medica';
    case "LAB":
      return 'Esame di Laboratorio';
    case "INSTRUMENTAL":
      return 'Esame Strumentale';

  }
}

export function ServiceTypeTag(p: { type: ServiceType }) {
  let icon: JSX.Element;
  let colors: string = '';
  const iconClassName = 'h-4'
  switch (p.type) {
    case "VISIT":
      icon = <AcademicCapIcon className={iconClassName} />
      colors = 'bg-sky-200 text-sky-950';
      break
    case "LAB":
      icon = <BeakerIcon className={iconClassName} />;
      colors = 'bg-lime-200 text-lime-950';
      break;
    case "INSTRUMENTAL":
      icon = <ServerStackIcon className={iconClassName} />
      colors = 'bg-fuchsia-200 text-fuchsia-950';
      break;
  }
  return (
    <div className={className("flex items-center gap-x-2 px-2 py-0.5 font-medium text-sm rounded", colors)}>
      {icon}
      <ServiceTypeLabel type={p.type} />
    </div>
  )
}