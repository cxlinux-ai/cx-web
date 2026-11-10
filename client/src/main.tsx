import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { initGA } from "./lib/ga";
import { assignHeroExperiment, experimentTag } from "./experiments/cx-hero-install-box";
import App from "./App";
import "./index.css";

// Order matters: assign the A/B arm, then configure GA with that arm's tag (so the first page_view
// carries it), then render the assigned hero. All synchronous, so there is no variant swap.
const heroAssignment = assignHeroExperiment();
initGA({ experimentTag: experimentTag(heroAssignment) });

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
