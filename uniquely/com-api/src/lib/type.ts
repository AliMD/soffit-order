import type {AlwatrDocumentObject} from '@alwatr/storage-client';

export type Order = AlwatrDocumentObject & {
  user: User;
  detail: OrderDetail;
  itemList: Array<ProductValue>
}

export type User = AlwatrDocumentObject & {
  name: string;
  phoneNumber: string;
  id: string;
  nationalCode: number;
}

export type OrderDetail = {
  description: string;
  reciver: User;
}

export type Product = AlwatrDocumentObject & {
  id: string;
  name: string;
  description: string;
  type: string;
  price: number;
}

export type ProductValue = Product & {
  value: number;
}
