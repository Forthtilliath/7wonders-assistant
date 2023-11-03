import { useCallback, useContext } from 'react';
import { ConfirmContext, ConfirmParams } from '@lib/confirmContext';

export function useConfirm() {
  const { confirmRef } = useContext(ConfirmContext);
  return {
    confirm: useCallback(
      (p: ConfirmParams) => {
        return confirmRef.current(p);
      },
      [confirmRef]
    ),
  };
}
