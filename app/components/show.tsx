import React from "react";

type ShowProps =
  | {
      unless: boolean;
    }
  | {
      if: boolean;
    };

export default function Show(props: { children: JSX.Element } & ShowProps) {
  const condition = "unless" in props ? !props.unless : props.if;
  if (condition) {
    return props.children;
  } else {
    return <React.Fragment />;
  }
}
