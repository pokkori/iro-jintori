export type ShopCategory = 'theme' | 'block_skin' | 'currency' | 'ad_free';

export interface ShopItem {
  readonly id: string;
  readonly category: ShopCategory;
  readonly name: string;
  readonly description: string;
  readonly price: ShopPrice;
  readonly previewImage: string;
}

export type ShopPrice =
  | { readonly type: 'coins'; readonly amount: number }
  | { readonly type: 'gems'; readonly amount: number }
  | { readonly type: 'iap'; readonly productId: string; readonly displayPrice: string };
