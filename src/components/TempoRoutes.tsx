import React, { Suspense } from "react";
import { useRoutes } from "react-router-dom";

const TempoRoutesComponent = React.lazy(() =>
  import("tempo-routes").then((m) => ({
    default: () => useRoutes(m.default),
  })),
);

export function TempoRoutes() {
  return (
    <Suspense fallback={null}>
      <TempoRoutesComponent />
    </Suspense>
  );
}
