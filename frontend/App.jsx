// App.jsx  (or your router root)
import { useAnalysis } from "./hooks/useAnalysis";
import SearchBar from "./components/SearchBar";
import ProductHero from "./components/ProductHero";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const analysis = useAnalysis();

  return (
    <div>
      
      <Dashboard analysis={analysis} />
    </div>
  );
}