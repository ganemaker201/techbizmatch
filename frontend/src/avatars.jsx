// Shared avatar definitions — emoji-based so they always render
export const AVATARS = [
  { id: 'piggy', label: 'Piggy Bank', emoji: '🐷', bgColor: 'bg-orange-100', borderColor: 'border-secondary' },
  { id: 'dollar', label: 'Dollar Bill', emoji: '💵', bgColor: 'bg-green-100', borderColor: 'border-primary' },
  { id: 'treasure', label: 'Treasure Chest', emoji: '💎', bgColor: 'bg-blue-100', borderColor: 'border-tertiary' },
  { id: 'calculator', label: 'Calculator', emoji: '🧮', bgColor: 'bg-red-100', borderColor: 'border-error' },
];

export function getAvatar(id) {
  return AVATARS.find(a => a.id === id) || AVATARS[0];
}

// Renders the avatar circle at a given size
// size: 'sm' (w-10), 'md' (w-14), 'lg' (w-20)
export function AvatarIcon({ avatarId, size = 'sm' }) {
  const avatar = getAvatar(avatarId);
  const sizeClasses = {
    sm: 'w-10 h-10 text-2xl',
    md: 'w-14 h-14 text-3xl',
    lg: 'w-20 h-20 text-5xl',
  };
  return (
    <div className={`${sizeClasses[size]} rounded-full ${avatar.bgColor} ${avatar.borderColor} border-2 flex items-center justify-center shadow-inner`}>
      <span>{avatar.emoji}</span>
    </div>
  );
}
