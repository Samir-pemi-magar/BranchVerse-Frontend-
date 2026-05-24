export const coverUrl = (cover: string) => {
  if (!cover) return "/images/placeholder-cover.png";
  if (cover.startsWith("http")) return cover;
  return `${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${cover}`;
};