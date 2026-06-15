import type { MsgUser } from "./types";
import { useEffect, useState } from "react";

interface UserAvatarProps {
  user?: MsgUser | { full_name?: string; email?: string; avatar_url?: string };
  size?: number;
}

export default function UserAvatar({ user, size = 32 }: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = (user?.full_name || user?.email || "?").charAt(0).toUpperCase();
  const avatarUrl = typeof user?.avatar_url === "string" && user.avatar_url.trim() ? user.avatar_url.trim() : null;

  useEffect(() => {
    setImageFailed(false);
  }, [avatarUrl]);

  return (
    <div
      className="user-avatar"
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: "50%",
        backgroundColor: "#e0e7ff",
        color: "#006BFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.38,
        userSelect: "none",
      }}
      title={user?.full_name || user?.email}
    >
      {avatarUrl && !imageFailed ? (
        <img
          src={avatarUrl}
          alt={user?.full_name || user?.email || "User avatar"}
          onError={() => setImageFailed(true)}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        initials
      )}
    </div>
  );
}
