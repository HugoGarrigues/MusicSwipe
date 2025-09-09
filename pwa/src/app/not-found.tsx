export default function NotFound() {
  return (
    <div className="min-h-dvh grid place-items-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Page introuvable</h1>
        <p className="text-white/70 mt-2">La page demandée n’existe pas.</p>
        <a href="/discover" className="inline-block mt-4 underline">Retour à Découvrir</a>
      </div>
    </div>
  );
}
