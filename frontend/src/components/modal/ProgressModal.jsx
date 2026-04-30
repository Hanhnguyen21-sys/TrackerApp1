import { X } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

export default function ProgressModal({
  isOpen,
  onClose,
  progress,
  tickets,
  columns,
}) {
  if (!isOpen) return null;

  const pieData = [
    { name: "Completed", value: progress.completedTasks },
    { name: "Incomplete", value: progress.incompleteTasks },
  ];

  const columnData = columns.map((column) => {
    const columnTickets = tickets.filter((ticket) => {
      const columnId =
        typeof ticket.column === "string" ? ticket.column : ticket.column?._id;

      return columnId === column._id;
    });

    return {
      name: column.title,
      total: columnTickets.length,
      completed: columnTickets.filter((ticket) => ticket.completed).length,
    };
  });

  const summaryCards = [
    { label: "Total Tasks", value: progress.totalTasks },
    { label: "Completed", value: progress.completedTasks },
    { label: "Incomplete", value: progress.incompleteTasks },
    { label: "Overdue", value: progress.overdueTasks },
    { label: "Due Soon", value: progress.dueSoonTasks },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-[#1e293b] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Project Progress
            </h2>
            <p className="mt-1 text-sm text-white/50">
              {progress.progress}% completed
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <p className="text-xs text-white/50">{card.label}</p>
              <p className="mt-2 text-2xl font-bold text-white">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">
              Completed vs Incomplete
            </h3>

            <div className="h-64">
              {progress.totalTasks === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-white/50">
                  No tasks yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      label
                    >
                      <Cell fill="#4ade80" />
                      <Cell fill="#94a3b8" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">
              Tasks by Column
            </h3>

            <div className="h-64">
              {progress.totalTasks === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-white/50">
                  No tasks yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={columnData}>
                    <XAxis dataKey="name" stroke="#cbd5e1" />
                    <YAxis stroke="#cbd5e1" allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#60a5fa" name="Total" />
                    <Bar dataKey="completed" fill="#4ade80" name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
