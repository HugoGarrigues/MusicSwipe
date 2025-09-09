"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useState } from "react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-dvh grid place-items-center px-4">
      <Card className="w-full max-w-sm p-6 flex flex-col gap-4 bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-white/10" />
          <h1 className="text-xl font-semibold">Bienvenue</h1>
          <p className="text-sm text-white/70">Veuillez créer votre compte</p>
        </div>
        <div className="flex flex-col gap-3">
          <label className="text-sm">Pseudo</label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Votre pseudo" />
          <label className="text-sm">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre email" type="email" />
          <label className="text-sm">Mot de passe</label>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Votre mot de passe" type="password" />
          <div className="text-sm text-white/70">Déjà inscrit ? <a className="underline" href="/login">Se connecter</a></div>
        </div>
        <Button>S’inscrire</Button>
        <div className="text-center text-white/50 text-xs">Or sign up with</div>
        <Button variant="outline">Spotify</Button>
      </Card>
    </div>
  );
}

