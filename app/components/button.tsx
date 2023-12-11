import classNames from "classnames";
import React, { useMemo } from "react";
import type { LinkProps } from "@remix-run/react";
import { Link, useNavigation } from "@remix-run/react";
import Spinner from "~/components/spinner";

export interface ButtonProps<T> {
  intent?: "danger" | "primary" | "none";
  small?: boolean;
  dark?: boolean;
  loading?: boolean;
  type?: "submit";
  action?: string;
  disabled?: boolean;
  minimal?: boolean;
  rightIcon?: JSX.Element;
  icon?: JSX.Element;
  className?: string;
  text?: string | JSX.Element;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  component?: React.ComponentType<T>;
  componentProps?: T;
}

export default function Button<T>(props: ButtonProps<T>) {
  const { intent, minimal, small, disabled, loading, type, dark } = props;
  const { state } = useNavigation();

  const isForm = type === "submit";
  const isSubmitting = loading ?? (isForm && state === "submitting");

  const className = classNames(
    "btn",
    {
      "btn-danger": intent === "danger",
      "btn-primary": intent === "primary",
      "btn-minimal": minimal,
      "btn-small": small,
      "btn-disabled": disabled,
      "btn-dark": dark,
      "btn-submitting": isSubmitting,
    },
    props.className
  );
  const Component: any = useMemo(
    () => props.component ?? ((p: T) => <button {...p} />),
    [props.component]
  );
  const componentProps = props.componentProps ?? ({} as T);
  const spacer =
    props.text != null && props.icon != null ? (
      <span className="pr-1" />
    ) : (
      <React.Fragment />
    );
  return (
    <Component
      name={props.action != null ? "_action" : null}
      value={props.action}
      className={className}
      {...componentProps}
      type={props.type ?? "button"}
      onClick={props.disabled !== true ? props.onClick : null}
    >
      <>
        {isSubmitting ? (
          <Spinner className={classNames({ "mr-1": props.text != null })} />
        ) : (
          props.icon
        )}
        {spacer}
        {props.text}
        {props.rightIcon}
      </>
    </Component>
  );
}

export function LinkButton(props: LinkProps & ButtonProps<LinkProps>) {
  const { to, ...other } = props;
  return <Button {...other} component={Link} componentProps={{ to }} />;
}
