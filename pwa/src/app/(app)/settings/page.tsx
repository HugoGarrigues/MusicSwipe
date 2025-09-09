import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Suspense } from "react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Paramètres</h1>
      <Card className="p-4 flex flex-col gap-3">
        <div className="text-sm text-white/80">Connexion et préférences</div>
        <Suspense>
          <div className="flex gap-2">
            <a href="/login">
              <Button variant="primary">Se connecter</Button>
            </a>
            <Button variant="outline">Se déconnecter</Button>
          </div>
        </Suspense>
      </Card>
    </div>
  );
}
