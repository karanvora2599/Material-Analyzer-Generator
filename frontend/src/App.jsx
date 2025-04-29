import Navbar from "./components/Navbar.jsx";
import Analyzer from "./pages/Analyzer";

export default function App() {
  return (
    <div className="min-h-screen bg-white text-neutral-900
                    dark:bg-neutral-900 dark:text-neutral-100">
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 pt-8">
        <Analyzer />
      </main>
    </div>
  );
}