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

    const headings = Array.from(el.querySelectorAll("h2[id], h3[id]")) as HTMLElement[];
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
      { rootMargin: "-64px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach((h) => observer.observe(h));
    observerRef.current = observer;

    return () => observer.disconnect();
  }, [contentRef]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Table of contents">
      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-3">
        On this page
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-3" : ""}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                setActiveId(item.id);
              }}
              className={`block text-sm leading-snug py-1 pl-3 border-l-2 transition-all duration-150 ${
                activeId === item.id
                  ? "border-[#00FF9F] text-white font-medium"
                  : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
