import axios from "axios";
import { LookType } from "@/types/lookTypes";

export const fetchLooks = async (userId: string): Promise<LookType[]> => {
  const res = await axios.get(`/api/looks?userId=${userId}`);
  const looksWithDominants = res.data.map((look: LookType) => {
    const colorCount: Record<string, number> = {};
    look.items.forEach(i => {
      const name = i.colorName || "Black";
      colorCount[name] = (colorCount[name] || 0) + 1;
    });
    const dominantColor = Object.entries(colorCount).sort((a,b)=>b[1]-a[1])[0]?.[0] || "Black";

    const styleCount: Record<string, number> = {};
    look.items.forEach(i => {
      const style = i.style || "casual";
      styleCount[style] = (styleCount[style] || 0) + 1;
    });
    const dominantStyle = Object.entries(styleCount).sort((a,b)=>b[1]-a[1])[0]?.[0] || "casual";

    return {
      ...look,
      colorName: dominantColor,
      style: dominantStyle,
    }
  });
  return looksWithDominants;
};
