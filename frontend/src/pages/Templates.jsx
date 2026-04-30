import { Code, GraduationCap, Palette, CalendarDays } from "lucide-react";
import { projectTemplates } from "../data/projectTemplates";
export default function Templates({ onUseTemplate, creating }) {
  const iconMap = {
    code: Code,
    school: GraduationCap,
    design: Palette,
    event: CalendarDays,
  };
  return (
    <div>
      <h2 className="text-3xl font-bold text-white">Templates</h2>
      <p className="mt-2 text-slate-400">
        Choose a template to quickly start a project.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {projectTemplates.map((template) => {
          const Icon = iconMap[template.icon] || Code;

          return (
            <div
              key={template.id}
              className="rounded-2xl border border-white/10 bg-[#22272b] p-5 hover:border-sky-500/40 transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                  <Icon size={22} />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {template.name}
                  </h3>
                  <p className="text-xs text-slate-500">{template.category}</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-400">
                {template.description}
              </p>

              <button
                type="button"
                onClick={() => onUseTemplate(template)}
                disabled={creating}
                className="mt-4 w-full rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 transition disabled:opacity-60"
              >
                {creating ? "Creating..." : "Use Template"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
