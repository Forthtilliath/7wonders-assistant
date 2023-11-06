import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmContextProvider, ConfirmParams } from '@lib';
import { render } from '../tests-utils';

describe('Hook: useConfirm', () => {
  it("should return an object with a 'confirm' function", () => {
    const Comp = () => {
      const hook = useConfirm();
      expectTypeOf(hook).toEqualTypeOf<{
        confirm: (p: ConfirmParams) => Promise<boolean>;
      }>();

      return null;
    };
    render(
      <ConfirmContextProvider>
        <Comp />
      </ConfirmContextProvider>
    );
  });

  it("should call the 'confirmRef' function with the provided parameters", () => {
    const Comp = () => {
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
    };
    render(
      <ConfirmContextProvider>
        <Comp />
      </ConfirmContextProvider>
    );
  });
});
