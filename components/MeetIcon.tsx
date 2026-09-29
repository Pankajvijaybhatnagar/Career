// Simple video-camera mark in Google Meet colours (generic icon, not the official logo).
export default function MeetIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden style={{ flexShrink: 0 }}>
      <rect x="4" y="12" width="28" height="24" rx="5" fill="#00897B" />
      <rect x="4" y="12" width="14" height="12" rx="5" fill="#4285F4" />
      <rect x="18" y="24" width="14" height="12" rx="5" fill="#34A853" />
      <path d="M32 21 L44 13 V35 L32 27 Z" fill="#FBBC04" />
    </svg>
  );
}
