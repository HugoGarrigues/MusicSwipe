import BottomNav from "@/components/layout/BottomNav";
import RequireAuth from "@/components/auth/RequireAuth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh pb-24" style={{ background: "linear-gradient(160deg, #3b0764 0%, #0b0b0f 70%)" }}>
      <main className="mx-auto max-w-md px-4 py-4">
        <RequireAuth>{children}</RequireAuth>
      </main>
      <BottomNav />
    </div>
  );
}
