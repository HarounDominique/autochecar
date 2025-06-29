export type Vehicle = {
  id: string;
  user_id: string;
  type: "car" | "motorcycle";
  brand: string;
  model: string;
  year: number;
  displacement: number;
  power: number;
  fuel: string;
  transmission: string;
  created_at: string;
};
