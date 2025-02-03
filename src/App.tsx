import { Suspense } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "./components/auth/AuthPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./lib/AuthContext";
import Home from "./components/home";
import routes from "tempo-routes";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<p>Loading...</p>}>
        <div>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            {import.meta.env.VITE_TEMPO === "true" && (
              <Route path="/tempobook/*" />
            )}
          </Routes>
        </div>
      </Suspense>
    </div>
  );
}

export default App;
