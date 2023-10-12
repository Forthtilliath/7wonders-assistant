interface IndexedDB {
  open: () => Promise<IDBDatabase>;

  execute<TResult = unknown, TReturn = TResult>(
    request: IDBRequest<IDBValidKey>,
    {
      onError,
      onSuccess,
    }: {
      onError?: (req: IDBRequest<IDBValidKey>) => DOMException | null;
      onSuccess: (req: IDBRequest<TResult>) => TReturn | TResult;
    }
  ): Promise<TReturn>;
  execute<TResult = unknown>(
    request: IDBRequest<IDBValidKey>,
    {
      onError,
      onSuccess,
    }: {
      onError?: (req: IDBRequest<IDBValidKey>) => DOMException | null;
      onSuccess?: (req: IDBRequest<TResult>) => TResult;
    }
  ): Promise<TResult>;
}
