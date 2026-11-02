import { studio } from "@/lib/knowledge.js";

export function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white/75">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="title title-light title-no-rule text-xl">{studio.name}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">Квиз и чат для компаний по Узбекистану. Офис в Ташкенте.</p>
        </div>
        <div>
          <p className="kicker kicker-light">офис</p>
          <p className="mt-3 text-sm text-white">{studio.address}</p>
        </div>
        <div>
          <p className="kicker kicker-light">связь</p>
          <p className="mt-3 text-sm font-semibold text-white">{studio.phone}</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-4 text-xs font-semibold capitalize sm:px-6">
          <p>© {new Date().getFullYear()} {studio.name}</p>
          <p>{studio.city}</p>
        </div>
      </div>
    </footer>
  );
}
