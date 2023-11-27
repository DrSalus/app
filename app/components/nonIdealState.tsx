import classNames from "classnames";

export default function NonIdealState(p: {
  className?: string;
  icon?: JSX.Element;
  title: string;
  description?: string;
}) {
  const className = classNames("non-ideal-state", p.className);
  return (
    <div className={className}>
      {p.icon}
      <div className="text-gray-600 mb-2">{p.title}</div>
      <div className="text-gray-500 text-sm">{p.description}</div>
    </div>
  );
}
