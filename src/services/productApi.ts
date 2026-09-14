// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import type { Product, ProductsResponse } from "@/types/product";

// interface GetProductsArgs {
//   limit: number;
//   skip: number;
// }

// export const productApi = createApi({
//   reducerPath: "productApi",
//   baseQuery: fetchBaseQuery({ baseUrl: "https://dummyjson.com" }),
//   endpoints: (builder) => ({
//      //  getProducts: builder.query<Products[], void>({ //fakestore dont need productresponseo only product array
//     getProducts: builder.query<ProductsResponse, GetProductsArgs>({
//       query: ({ limit, skip }) => `/products?limit=${limit}&skip=${skip}`,
//     }),
//     getProductById: builder.query<Product, number>({
//       query: (id) => `/products/${id}`,
//     }),
//   }),
// });

// export const { useGetProductsQuery, useGetProductByIdQuery } = productApi;


import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Product, ProductsResponse } from "@/types/product";

interface GetProductsArgs {
  limit: number;
  skip: number;
}

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://dummyjson.com" }),
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse, GetProductsArgs>({
      query: ({ limit, skip }) => `/products?limit=${limit}&skip=${skip}`,
    }),
    getProductById: builder.query<Product, number>({
      query: (id) => `/products/${id}`,
    }),
    getCategoryList: builder.query<string[], void>({
      query: () => "/products/category-list",
    }),
    getProductsByCategory: builder.query<ProductsResponse, string>({
      query: (category) => `/products/category/${category}`,
    }),
    addProduct: builder.mutation<Product, Partial<Product>>({
      query: (newProduct) => ({
        url: "/products/add",
        method: "POST",
        body: newProduct,
      }),
    }),
    updateProduct: builder.mutation<Product, { id: number; changes: Partial<Product> }>({
      query: ({ id, changes }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: changes,
      }),
    }),
    deleteProduct: builder.mutation<Product, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetCategoryListQuery,
  useGetProductsByCategoryQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;