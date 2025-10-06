import React from "react";

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: any }
> {
  constructor(p:any){ super(p); this.state = { error: null }; }
  static getDerivedStateFromError(error:any){ return { error }; }
  render(){
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: "#fff", background: "#111", fontFamily:"ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}>
          <h2 style={{marginTop:0}}>Something crashed</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
