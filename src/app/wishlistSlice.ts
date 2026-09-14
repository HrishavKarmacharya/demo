import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface WishlistState {
  productIds: number[];
}

function loadWishlistFromStorage(): number[] {
  try {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveWishlistToStorage(productIds: number[]) {
  localStorage.setItem("wishlist", JSON.stringify(productIds));
}

const initialState: WishlistState = {
  productIds: loadWishlistFromStorage(),
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      if (state.productIds.includes(id)) {
        state.productIds = state.productIds.filter((pid) => pid !== id);
      } else {
        state.productIds.push(id);
      }
      saveWishlistToStorage(state.productIds);
    },
  },
});

export const { toggleWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;