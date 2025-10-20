/**
 * Helper Utility Functions
 *
 * General-purpose functions used throughout the app.
 */

/**
 * Generate a unique ID for messages/conversations
 * Uses timestamp + random string for uniqueness
 */
export const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format timestamp for display
 * Examples: "Just now", "5m ago", "2h ago", "Yesterday", "Jan 15"
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";

  const now = Date.now();
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const diff = now - date.getTime();

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  switch (true) {
    case diff < 60000: // Less than 1 minute
      return "Just now";

    case diff < 3600000: // Less than 1 hour
      return `${Math.floor(diff / 60000)}m ago`;

    case diff < 86400000: // Less than 24 hours
      return `${Math.floor(diff / 3600000)}h ago`;

    case diff < 172800000: // Less than 2 days
      return "Yesterday";

    case diff < 604800000: // Less than 7 days
      return `${Math.floor(diff / 86400000)}d ago`;

    default: // Older than 7 days - show date
      return `${months[date.getMonth()]} ${date.getDate()}`;
  }
};

/**
 * Format last seen timestamp for user presence
 * Examples: "Just now", "5 mins ago", "2 hours ago", "3 days ago"
 */
export const formatLastSeen = (timestamp) => {
  if (!timestamp) return "Unknown";

  const now = Date.now();

  // Handle Firestore Timestamp objects (have .seconds property)
  let date;
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (timestamp.seconds) {
    // Firestore Timestamp
    date = new Date(timestamp.seconds * 1000);
  } else if (typeof timestamp === "number") {
    // Unix timestamp in milliseconds
    date = new Date(timestamp);
  } else {
    return "Unknown";
  }

  const diff = now - date.getTime();

  switch (true) {
    case diff < 60000: // Less than 1 minute
      return "Just now";

    case diff < 3600000: {
      // Less than 60 minutes
      const mins = Math.floor(diff / 60000);
      return `${mins} ${mins === 1 ? "min" : "mins"} ago`;
    }

    case diff < 86400000: {
      // Less than 24 hours
      const hours = Math.floor(diff / 3600000);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    default: {
      // Days ago
      const days = Math.floor(diff / 86400000);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }
  }
};

/**
 * Format message time for chat bubbles
 * Examples: "10:30 AM", "Yesterday 3:45 PM"
 */
export const formatMessageTime = (timestamp) => {
  if (!timestamp) return "";

  // Handle Firestore Timestamp objects (have .seconds property)
  let date;
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (timestamp.seconds) {
    // Firestore Timestamp
    date = new Date(timestamp.seconds * 1000);
  } else if (typeof timestamp === "number") {
    // Unix timestamp in milliseconds
    date = new Date(timestamp);
  } else {
    return "";
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  switch (true) {
    case isToday:
      return timeStr;

    case isYesterday:
      return `Yesterday ${timeStr}`;

    default: {
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return `${dateStr} ${timeStr}`;
    }
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate username format (lowercase, no spaces, alphanumeric + underscores)
 */
export const isValidUsername = (username) => {
  const usernameRegex = /^[a-z0-9_]+$/;
  return usernameRegex.test(username) && username.length >= 3;
};

/**
 * Generate initials from name for avatar placeholder
 * Example: "John Doe" => "JD"
 */
export const getInitials = (name) => {
  if (!name) return "?";

  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Generate a random color for avatar backgrounds
 */
export const getAvatarColor = (userId) => {
  const colors = [
    "#ef4444",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
  ];

  // Use userId to generate consistent color for same user
  const index = userId ? userId.charCodeAt(0) % colors.length : 0;
  return colors[index];
};
