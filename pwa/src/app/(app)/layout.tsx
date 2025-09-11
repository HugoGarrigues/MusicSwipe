import BottomNav from "@/components/layout/BottomNav";
import RequireAuth from "@/components/auth/RequireAuth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh pb-24">
      <main className="mx-auto max-w-md px-4 py-4">
        <RequireAuth>{children}</RequireAuth>
      </main>
      <BottomNav />
    </div>
  );
}
