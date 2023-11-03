import {
  type ComponentPropsWithoutRef,
  createContext,
  type PropsWithChildren,
  useContext,
  useRef,
  useState,
} from 'react';
import { ConfirmDialog } from '@components/shared/ConfirmDialog';

export type ConfirmParams = Partial<
  Omit<
    ComponentPropsWithoutRef<typeof ConfirmDialog>,
    'open' | 'onConfirm' | 'onCancel'
  >
>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultFunction = (_p?: ConfirmParams) => Promise.resolve(true); // En l'absence de contexte, on renvoie true directement

const defaultValue = {
  confirmRef: {
    current: defaultFunction,
  },
};

export const ConfirmContext = createContext(defaultValue);

// On devra entourer notre application avec ce context provider
export function ConfirmContextProvider({ children }: PropsWithChildren) {
  const confirmRef = useRef(defaultFunction);
  return (
    <ConfirmContext.Provider value={{ confirmRef }}>
      {children}
      <ConfirmDialogWithContext />
    </ConfirmContext.Provider>
  );
}

function ConfirmDialogWithContext() {
  const [open, setOpen] = useState(false);
  const [props, setProps] = useState<undefined | ConfirmParams>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const resolveRef = useRef((_v: boolean) => {});
  const { confirmRef } = useContext(ConfirmContext);
  confirmRef.current = (props) =>
    new Promise((resolve) => {
      setProps(props);
      setOpen(true);
      resolveRef.current = resolve;
    });

  const onConfirm = () => {
    resolveRef.current(true);
    setOpen(false);
  };

  const onCancel = () => {
    resolveRef.current(false);
    setOpen(false);
  };
  return (
    <ConfirmDialog
      onConfirm={onConfirm}
      onCancel={onCancel}
      open={open}
      {...props}
    />
  );
}
