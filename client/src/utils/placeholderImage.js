export const placeholderImage = (name) => {
  // Simple hash to color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${Math.abs(hash % 360)}, 70%, 60%)`;
  return `https://via.placeholder.com/300x300/${color.replace('#', '')}/ffffff?text=${encodeURIComponent(name.substring(0, 10))}`;
};
