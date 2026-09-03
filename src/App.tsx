import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { AppLayout } from "./components/AppLayout";
import { MesRetours } from "./pages/MesRetours";
import { NouveauRetour } from "./pages/NouveauRetour";
import { Kanban } from "./pages/Kanban";
import { ProfileSync } from "./components/ProfileSync";
import { AuthSwitch } from "./components/ui/auth-switch";

/**
 * Toute l'app est derrière l'authentification Clerk (prod, partagée avec les 6
 * autres apps) : un retour est toujours rattaché à un utilisateur identifié.
 */
export default function App() {
  return (
    <>
      {/* Hors de toute garde d'authentification : l'origine de l'inscription
          se constitue pendant la visite déconnectée. */}
      <ProfileSync app="feedback" />
      <SignedOut>
        <AuthSwitch appName="Feedback" logoSrc="/mesoutils-light.png" />
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
