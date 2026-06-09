import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Navbar />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </>
  );
}