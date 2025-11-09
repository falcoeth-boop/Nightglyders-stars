export type Star = {
  id: string;
  address: string;
  tokenId?: string;
  auraRate: number;
  auraTotal: number;
  lastUpdate: number;
  x: number; y: number; z: number;
};

export type HoldingsResponse = {
  unlistedCount: number;
  tokens: { contract?: string; tokenId: string; listed: boolean }[];
};