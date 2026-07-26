import { useEffect, useRef, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  contentRef: React.RefObject<HTMLDivElement>;
}

export function TableOfContents({ contentRef }: TableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    // Wait a tick so the MDX renders its headings before we query.
    const collect = () => {
      const headings = Array.from(el.querySelectorAll("h2[id], h3[id]")) as HTMLElement[];
      if (headings.length === 0) return false;

      setItems(
        headings.map((h) => ({
          id: h.id,
          text: h.textContent ?? "",
          level: h.tagName === "H2" ? 2 : 3,
        }))
      );

      observerRef.current?.disconnect();

      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.filter((e) => e.isIntersecting);
          if (visible.length > 0) {
            setActiveId(visible[0].target.id);
          }
        },
        { rootMargin: "-80px 0px -65% 0px", threshold: 0 }
      );

      headings.forEach((h) => observer.observe(h));
      observerRef.current = observer;
      return true;
    };

    // Try immediately, then retry after paint in case MDX is still streaming.
    if (!collect()) {
      const id = requestAnimationFrame(() => collect());
      return () => {
        cancelAnimationFrame(id);
        observerRef.current?.disconnect();
      };
    }
    return () => observerRef.current?.disconnect();
  }, [contentRef]);

  if (items.length === 0) return null;

  const activeIndex = Math.max(0, items.findIndex((i) => i.id === activeId));

  return (
    <nav aria-label="Table of contents" className="relative">
      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-4">
        On this page
      </p>

      {/* Vertical timeline */}
      <div className="relative pl-5">
        {/* Vertical track */}
        <div className="absolute left-1 top-1.5 bottom-1.5 w-px bg-white/8" />
        {/* Active fill */}
        <div
          className="absolute left-1 top-1.5 w-px bg-[#00FF9F] transition-all duration-300"
          style={{
            height: items.length > 0 ? `${((activeIndex + 1) / items.length) * 100}%` : "0%",
          }}
        />

        <ul className="space-y-2.5">
          {items.map((item, i) => {
            const isActive = activeId === item.id;
            const isPassed = i < activeIndex;
            return (
              <li key={item.id} className="relative">
                {/* Timeline dot */}
                <span
                  className={`absolute -left-[18px] top-[7px] w-2 h-2 rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-[#00FF9F] ring-4 ring-[#00FF9F]/20 scale-110"
                      : isPassed
                      ? "bg-[#00FF9F]/60"
                      : "bg-white/10"
                  }`}
                />
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.getElementById(item.id);
                    if (target) {
                      const top = target.getBoundingClientRect().top + window.scrollY - 80;
                      window.scrollTo({ top, behavior: "smooth" });
                      setActiveId(item.id);
                    }
                  }}
                  className={`block no-underline outline-none text-sm leading-snug py-0.5 transition-colors duration-150 ${
                    item.level === 3 ? "pl-3 text-[13px]" : ""
                  } ${
                    isActive
                      ? "text-white font-medium"
                      : isPassed
                      ? "text-gray-400"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
