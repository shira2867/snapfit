import type { Collection, Db } from "mongodb";
import { getDb } from "./db";

export type LookItem = {
  _id: string;             
  categoryId: string;     
  imageUrl: string;      
  colorName: string;     
  thickness: "light" | "medium" | "heavy"; 
  style: string;           
  tags?: string[];        
  createdAt?: Date;        
};

export type LookType = {
  _id: string;        
  userId: string;       
  items: LookItem[];     
  imageUrl?: string;    
  createdAt?: Date;       
};

export async function looksCollection(): Promise<Collection<LookType>> {
  const db = (await getDb()) as Db;
  return db.collection("looks") as Collection<LookType>;
}
