import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  productId: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

function loadCartFromStorage(): CartItem[] {
  try {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]) {
  localStorage.setItem("cart", JSON.stringify(items));
}

const initialState: CartState = {
  items: loadCartFromStorage(),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{ productId: number; stock: number }>,
    ) => {
      const { productId, stock } = action.payload;
      const existing = state.items.find((item) => item.productId === productId);
      if (existing) {
        if (existing.quantity < stock) {
          existing.quantity += 1;
        }
      } else {
        state.items.push({ productId, quantity: 1 });
      }
      saveCartToStorage(state.items);
    },
    increaseQuantity: (
      state,
      action: PayloadAction<{ productId: number; stock: number }>,
    ) => {
      const { productId, stock } = action.payload;
      const item = state.items.find((item) => item.productId === productId);
      if (item && item.quantity < stock) {
        item.quantity += 1;
      }
      saveCartToStorage(state.items);
    },
    decreaseQuantity: (state, action: PayloadAction<number>) => {
      const item = state.items.find(
        (item) => item.productId === action.payload,
      );
      if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
          state.items = state.items.filter(
            (i) => i.productId !== action.payload,
          );
        }
      }
      saveCartToStorage(state.items);
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload,
      );
      saveCartToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage(state.items);
    },
  },
});

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
