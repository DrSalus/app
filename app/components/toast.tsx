import {
  NoSymbolIcon,
  CheckIcon,
  EyeIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import classNames from "classnames";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export type ToastProps = {
  title: string;
  description: string;
  icon?: JSX.Element;
  type: "success" | "danger" | "warning" | "info";
  className?: string;
};

interface DelayProps {
  children: ReactNode;
  delay: number;
}

export default function Toast(props: ToastProps) {
  let toast: ToastProps = props;
  switch (props.type) {
    case "success":
      toast = {
        ...props,
        icon: props.icon ?? <CheckIcon className="w-6 mr-2" />,
        className: "bg-green-600",
      };
      break;
    case "danger":
      toast = {
        ...props,
        icon: props.icon ?? <NoSymbolIcon className="w-6 mr-2" />,
        className: "bg-red-500",
      };
      break;
    case "info":
      toast = {
        ...props,
        icon: props.icon ?? <EyeIcon className="w-6 mr-2" />,
        className: "bg-sky-700",
      };
      break;
    case "warning":
      toast = {
        ...props,
        icon: props.icon ?? <InformationCircleIcon className="w-6 mr-2" />,
        className: "bg-orange-600",
      };
      break;
  }

  const ToastManager = (props: DelayProps) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
      setTimeout(() => {
        setVisible(false);
      }, props.delay);
    }, [props.delay]);

    return visible ? <div>{props.children}</div> : <div />;
  };

  return (
    <ToastManager delay={50000}>
      <div className="toast-container toast-container-top-left">
        <div className={classNames("toast", toast.className)}>
          <div className="flex items-center px-1  py-1">
            {toast.icon}
            <div className="flex flex-col">
              <p className="font-semibold flex-grow">{toast.title}</p>
              <p className="font-light text-sm">{toast.description}</p>
            </div>
          </div>
        </div>
      </div>
    </ToastManager>
  );
}
