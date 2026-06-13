import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HCalc — Premium Modern Calculator" },
      { name: "description", content: "HCalc — kalkulator premium modern dengan scientific, programmer, graph, statistics & voice." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4">
      <div className="max-w-md text-center text-white">
        <h1 className="text-4xl font-bold mb-3">HCalc</h1>
        <p className="text-slate-300 mb-6">Aplikasi kalkulator premium modern (vanilla HTML/CSS/JS).</p>
        <a
          href="/hcalc/index.html"
          className="inline-block px-6 py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 transition font-semibold shadow-lg shadow-blue-500/40"
        >
          Buka HCalc →
        </a>
      </div>
    </div>
  );
}
