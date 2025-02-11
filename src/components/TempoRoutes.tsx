import React, { Suspense } from "react";

const TempoRoutesComponent = React.lazy(() =>
  import("tempo-routes").then((m) => ({ default: m.default })),
);

export function TempoRoutes() {
  return (
    <Suspense fallback={null}>
      <TempoRoutesComponent />
    </Suspense>
  );
}
