interface BaiAvatarProps {
  status?: "online" | "offline" | "busy";
}

const statusColors: Record<NonNullable<BaiAvatarProps["status"]>, string> = {
  online: "bg-emerald-400",
  offline: "bg-slate-500",
  busy: "bg-amber-400"
};

export function BaiAvatar({ status = "online" }: BaiAvatarProps) {
  return (
    <div className="relative">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand to-indigo-500 text-xl font-semibold text-white">
        B
      </div>
      <span
        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 ${statusColors[status]}`}
        aria-label={`Estado ${status}`}
      />
    </div>
  );
}
