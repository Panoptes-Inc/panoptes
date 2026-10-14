declare module 'zod' {
  export const z: any;
  export namespace z {
    type ZodTypeAny = any;
    type infer<T> = any;
  }
}
