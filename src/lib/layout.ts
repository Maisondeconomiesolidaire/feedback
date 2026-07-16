/**
 * Gouttière unique de l'application.
 *
 * L'en-tête, le titre de page et le contenu doivent partager **exactement** la
 * même largeur et le même padding, sinon leurs bords gauches ne tombent pas au
 * même endroit (la barre de nav était centrée sur 6xl pendant que les titres
 * partaient du bord de l'écran). Toute nouvelle zone de page passe par ici.
 */
export const CONTAINER = "mx-auto w-full max-w-6xl px-4 sm:px-6";
