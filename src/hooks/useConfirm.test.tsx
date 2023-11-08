import { FC } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmContextProvider, ConfirmParams } from '@lib';
import { render } from '../__tests__/tests-utils';

const renderComp = (Comp: FC) =>
  render(
    <ConfirmContextProvider>
      <Comp />
    </ConfirmContextProvider>
  );

describe('Hook: useConfirm', () => {
  it("should return an object with a 'confirm' function", () => {
    renderComp(() => {
      const hook = useConfirm();
      expectTypeOf(hook).toEqualTypeOf<{
        confirm: (p: ConfirmParams) => Promise<boolean>;
      }>();

      return null;
    });
  });

  it("should call the 'confirmRef' function with the provided parameters", () => {
    renderComp(() => {
      const hook = useConfirm();
      const spy = vi.spyOn(hook, 'confirm');
      const params: ConfirmParams = {
        title: 'Confirmation',
        content: 'Are you sure?',
      };
      hook.confirm(params);
      expect(spy).toHaveBeenCalledWith(params);
      expect(spy).toHaveBeenCalledTimes(1);

      return null;
    });
  });
});
