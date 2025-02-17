interface ActivityIndicatorProps {
  lastActive?: string | null;
}

export function ActivityIndicator({ lastActive }: ActivityIndicatorProps) {
  if (!lastActive) return null;

  const lastActiveDate = new Date(lastActive);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - lastActiveDate.getTime()) / (1000 * 60),
  );

  let status = "offline";
  if (diffInMinutes < 5) {
    status = "online";
  } else if (diffInMinutes < 30) {
    status = "away";
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <div
        className={`w-2 h-2 rounded-full ${status === "online" ? "bg-green-500" : status === "away" ? "bg-yellow-500" : "bg-gray-500"}`}
      />
      <span>
        {status === "online"
          ? "Online"
          : status === "away"
            ? "Away"
            : "Last seen " + lastActiveDate.toLocaleDateString()}
      </span>
    </div>
  );
}
