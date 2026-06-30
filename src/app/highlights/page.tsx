import { permanentRedirect } from "next/navigation";

// All highlights are now shown on the home page profile section.
export default function HighlightsPage() {
  permanentRedirect("/#highlights");
}
