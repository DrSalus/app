import React from "react";

const MAX_RETRIES = 5;

export class ErrorBoundary extends React.Component<
  any,
  {
    hasError: boolean;
    retries: number;
    fallback?: JSX.Element;
  }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, retries: 0 };
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    if (this.state.retries < MAX_RETRIES) {
      setInterval(() => {
        this.setState({ retries: this.state.retries + 1, hasError: false });
      }, 300);
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback ?? <React.Fragment />;
    }

    return this.props.children;
  }
}
