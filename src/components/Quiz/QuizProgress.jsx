export function QuizProgress({ step, total }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-mute">
        <span>
          Шаг {step} из {total}
        </span>
        <span>{Math.round((step / total) * 100)}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-gradient-to-r from-accent-2 to-accent transition-[width] duration-300" style={{ width: `${(step / total) * 100}%` }} />
      </div>
    </div>
  );
}
