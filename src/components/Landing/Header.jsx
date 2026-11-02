import { Menu, Moon, Phone, Sun, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { useApp } from "@/context/AppContext.jsx";
import { useTheme } from "@/hooks/useTheme.js";
import { studio } from "@/lib/knowledge.js";

const links = [
  { href: "#pains", label: "Задачи" },
  { href: "#trust", label: "Как считаем" },
  { href: "#services", label: "Цены" },
  { href: "#contacts", label: "Офис" },
];

export function Header() {
  const { openQuiz } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30">
      <div className="hidden bg-accent-2 text-white md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-sm font-semibold sm:px-6">
          <p className="text-white/85">{studio.hours}</p>
          <a className="inline-flex items-center gap-2 text-white hover:text-accent" href={`tel:${studio.phone.replace(/\s/g, "")}`}>
            <Phone size={14} />
            {studio.phone}
          </a>
        </div>
      </div>

      <div className="border-b border-line bg-paper/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#top" className="title title-no-rule flex items-center gap-2 text-lg">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent-2 to-accent text-white shadow-md">
              <Sparkles size={18} />
            </span>
            <span>
              {studio.name}
              <span className="mt-0.5 block font-sans text-xs font-semibold text-mute normal-case">{studio.city}</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-bold capitalize md:flex">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="text-ink hover:text-accent">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="min-h-11 min-w-11 rounded-full px-0"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button className="hidden sm:inline-flex" onClick={openQuiz}>
              AI-расчёт
            </Button>
            <Button
              variant="ghost"
              className="min-h-11 min-w-11 rounded-full px-0 md:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {menuOpen ? (
          <nav className="grid gap-1 border-t border-line px-4 py-3 md:hidden">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="min-h-11 px-1 py-2 text-sm font-bold capitalize text-ink"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Button onClick={() => { setMenuOpen(false); openQuiz(); }}>Запустить AI-расчёт</Button>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
