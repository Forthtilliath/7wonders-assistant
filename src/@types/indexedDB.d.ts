interface IndexedDB {
  open: () => Promise<IDBDatabase>;

  execute<TResult = unknown, TReturn = TResult>(
    request: IDBRequest<TResult> | IDBRequest<IDBValidKey>,
    {
      onError,
      onSuccess,
    }: {
      onError?: (req: IDBRequest<IDBValidKey>) => DOMException | null;
      onSuccess: (req: IDBRequest<TResult>) => TReturn;
    }
  ): Promise<TReturn>;
  execute<TResult = unknown>(
    request: IDBRequest<TResult> | IDBRequest<IDBValidKey>,
    {
      onError,
      onSuccess,
    }: {
      onError?: (req: IDBRequest<IDBValidKey>) => DOMException | null;
      onSuccess?: (req: IDBRequest<TResult>) => TResult;
    }
  ): Promise<TResult>;
}
