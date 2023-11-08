import { XMarkIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import {
  useNavigate,
  Outlet,
  useOutlet,
  useNavigation,
} from "@remix-run/react";

export default function Overlay(p: { children: JSX.Element; isOpen: boolean }) {
  return (
    <div
      className={classNames("overlay", {
        open: p.isOpen,
      })}
    >
      {p.children}
    </div>
  );
}

export function OverlayOutlet() {
  const outlet = useOutlet();

  return (
    <>
      <Overlay isOpen={outlet != null}>
        <Outlet />
      </Overlay>
    </>
  );
}

export function CloseNestedDialog() {
  const navigate = useNavigate();

  return (
    <XMarkIcon
      className="close-button text-white text-lg"
      onClick={() => navigate("..")}
    />
  );
}

export function DialogCloseOnSubmit(p: { onClose?: () => void }) {
  const { state } = useNavigation();
  const { onClose } = p;
  const [closeOnIdle, setCloseOnIdle] = useState(false);

  useEffect(() => {
    if (state === "submitting") {
      return setCloseOnIdle(true);
    }
    if (state === "idle" && closeOnIdle) {
      onClose?.();
      setCloseOnIdle(false);
    }
  }, [state]);

  return <React.Fragment />;
}
