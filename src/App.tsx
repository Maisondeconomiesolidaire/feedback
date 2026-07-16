import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, SignIn } from "@clerk/clerk-react";
import { AppLayout } from "./components/AppLayout";
import { MesRetours } from "./pages/MesRetours";
import { NouveauRetour } from "./pages/NouveauRetour";
import { Kanban } from "./pages/Kanban";

/**
 * Toute l'app est derrière l'authentification Clerk (prod, partagée avec les 6
 * autres apps) : un retour est toujours rattaché à un utilisateur identifié.
 */
export default function App() {
  return (
    <>
      <SignedOut>
        <div className="flex min-h-screen items-center justify-center bg-[var(--crm-bg)] p-4">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-zinc-100">Feedback</h1>
              <p className="mt-2 text-sm text-zinc-400">
                Connectez-vous avec votre compte habituel pour nous faire un retour sur
                les applications du groupe.
              </p>
            </div>
            <SignIn routing="hash" />
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<MesRetours />} />
            <Route path="/nouveau" element={<NouveauRetour />} />
            <Route path="/kanban" element={<Kanban />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </SignedIn>
    </>
  );
}
