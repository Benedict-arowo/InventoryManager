export type InventoryItems = {
  id: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  quantity: number;
  category: {
    name: string;
  };
  price_per_unit: number;
  quantity_sold: number;
  low_stock_threshold: number;
  is_service: boolean;
};
