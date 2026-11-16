import React from 'react';

/**
 * Keeps a 3D widget from taking the page down with it.
 *
 * Two things can go wrong inside a react-three-fiber <Canvas>:
 *  1. It suspends (for example while drei's <Text> downloads its font). The
 *     Canvas passes that suspension up into the normal DOM tree. With no
 *     Suspense boundary above it, React cannot commit ANY later update on the
 *     page, so buttons log a click but modals never open.
 *  2. It throws (WebGL switched off, lost context). With no error boundary the
 *     whole page unmounts.
 * This wrapper gives both a boundary, so the rest of the page keeps working and
 * the 3D box shows a plain placeholder instead.
 */
class Boundary extends React.Component<{ fallback: React.ReactNode; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn('3D view switched off:', error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export const Safe3D: React.FC<{ children: React.ReactNode; label?: string }> = ({ children, label = '3D view' }) => {
  const placeholder = (
    <div
      className="w-full h-full min-h-[120px] flex items-center justify-center font-mono text-[11px] text-white/50 bg-[#090A0D]"
      data-testid="safe3d-fallback"
    >
      {label} is loading or not available in this browser
    </div>
  );
  return (
    <Boundary fallback={placeholder}>
      <React.Suspense fallback={placeholder}>{children}</React.Suspense>
    </Boundary>
  );
};
