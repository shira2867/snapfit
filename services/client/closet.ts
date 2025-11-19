

import axios from "axios";
import { ClothingItem } from "@/types/clothTypes";
export const fetchClothes = async (userId: string): Promise<ClothingItem[]> => {
  const res = await axios.get(`/api/clothing?userId=${userId}`);
  return res.data;
};