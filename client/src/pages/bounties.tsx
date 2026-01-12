import Footer from "@/components/Footer";
import { BountiesBoard } from "@/components/bounties";

export default function BountiesPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Main Content */}
      <BountiesBoard />

      {/* Footer */}
      <Footer />
    </div>
  );
}
