// Temporary screen to check that React + Tailwind work. Replaced in Step 1.
function App() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-6 p-6">
      <p className="text-sm font-semibold tracking-widest text-brand-500 uppercase">
        Platforma civic-tech · Prishtinë
      </p>
      <h1 className="font-display text-5xl font-bold text-brand-900">Save the Food</h1>
      <p className="text-lg">
        Ushqimi që mund të ndihmojë dikë nuk duhet të bëhet mbeturinë.
      </p>
      <div className="rounded-2xl bg-cream-50 p-4 text-crust-700 ring-1 ring-cream-100">
        🍞 Hapi 0 funksionon: React + Vite + Tailwind
      </div>
      <button className="h-14 rounded-2xl bg-brand-700 text-lg font-semibold text-white active:scale-95">
        Fillo
      </button>
    </main>
  )
}

export default App
