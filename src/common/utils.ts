export const toIntOrNull = (v?: string) =>
    (v != null || v != undefined) && /^-?\d+$/.test(v) 
        ? parseInt(v, 10) 
        : null;

export type CardImageType = "full" | "small" | "cropped";

const PATHS: Record<CardImageType, string> = {
  full: "cards",
  small: "cards_small",
  cropped: "cards_cropped",
};

const BASE_URL = "https://images.ygoprodeck.com/images";

export const getCardImageUrl = (
  id: number,
  type: CardImageType = "full"
) => {
  return `${BASE_URL}/${PATHS[type]}/${id}.jpg`;
};