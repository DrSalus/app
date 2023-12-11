import classNames from "classnames";

export default function Background(p: {
  className?: string;
  children: JSX.Element;
}) {
  return (
    <div
      className={classNames(
        "bg-gradient-to-b from-sky-800 to-sky-700",
        p.className
      )}
    >
      <img
        src="/hero.jpg"
        alt="A doctor in background"
        className="absolute opacity-10 w-full h-full object-cover overflow-hidden"
      />
      {p.children}
    </div>
  );
}
