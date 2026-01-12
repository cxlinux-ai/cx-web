import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { updateSEO } from "@/lib/seo";
import Footer from "@/components/Footer";

export default function MissionPage() {
  useEffect(() => {
    const cleanup = updateSEO({
      title: 'Why Cortex Linux Exists | Our Mission',
      description: 'Cortex Linux exists to make AI a first-class system capability. Learn about our philosophy, long-term vision, and why operating systems must evolve for the AI era.',
      canonicalPath: '/mission',
      keywords: ['Cortex Linux mission', 'AI operating system', 'AI-native Linux', 'AI infrastructure', 'why Cortex exists']
    });
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <article className="pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/">
            <span className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-12 cursor-pointer text-sm" data-testid="link-back-home">
              <ArrowLeft size={16} />
              Back to Home
            </span>
          </Link>

          <header className="mb-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white" data-testid="heading-mission">
              Why Cortex Linux Exists
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Cortex Linux was created with a single premise: AI should not be bolted onto operating systems as an afterthought. 
              It should be a foundational layer — integrated, reliable, and invisible when it needs to be.
            </p>
          </header>

          <div className="space-y-16">
            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">AI as Infrastructure</h2>
              <p className="text-gray-400 leading-relaxed">
                Most AI tooling sits above the operating system, creating friction between intent and execution. 
                Cortex inverts this by embedding intelligence directly into the system layer. 
                Natural language becomes a native interface, not a wrapper around shell scripts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Why Operating Systems Must Change</h2>
              <p className="text-gray-400 leading-relaxed">
                The way we interact with computers has remained largely unchanged for decades. 
                Command-line interfaces require memorization. GUIs require navigation. 
                Both assume the user knows exactly what to ask for and how to ask for it. 
                AI changes this equation — systems can now interpret intent and execute accordingly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Designed for Builders, Not Demos</h2>
              <p className="text-gray-400 leading-relaxed">
                Cortex is not a prototype or a research project. It is built for production use by developers, 
                system administrators, and engineering teams who need reliability alongside intelligence. 
                Every feature is designed to be auditable, reversible, and transparent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Long-Term, Open, Accountable</h2>
              <p className="text-gray-400 leading-relaxed">
                Cortex Linux is open source because infrastructure should be inspectable. 
                We are building for the long term — decisions are made with sustainability in mind, 
                not hype cycles. Accountability is baked into how we work: public roadmaps, 
                documented decisions, and a commitment to the community that uses this software.
              </p>
            </section>
          </div>

          <div className="mt-20 pt-12 border-t border-white/10">
            <p className="text-gray-500 text-sm">
              This is the philosophical foundation of Cortex Linux. 
              For technical details, see our <Link href="/getting-started" className="text-gray-400 hover:text-white transition-colors underline">documentation</Link> or 
              explore the <a href="https://github.com/cortexlinux/cortex" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors underline">source code</a>.
            </p>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
