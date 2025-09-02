import type { PropsWithChildren, ReactElement, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

type ModalRenderer = ReactElement | ((close?: () => void) => ReactElement);

type ModalContextValue = {
  openModal: (renderer: ModalRenderer) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return ctx;
}

export function ModalProvider({ children }: PropsWithChildren): ReactElement {
  const [content, setContent] = useState<ReactNode | null>(null);

  const closeModal = useCallback(() => {
    setContent(null);
  }, []);

  const openModal = useCallback(
    (renderer: ModalRenderer) => {
      setContent(
        renderer
          ? typeof renderer === "function"
            ? renderer(closeModal)
            : renderer
          : null
      );
    },
    [closeModal]
  );

  const value = useMemo(
    () => ({ openModal, closeModal }),
    [openModal, closeModal]
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Modal
        style={{ minHeight: "50%" }}
        visible={!!content}
        animationType="fade"
        transparent
        onRequestClose={closeModal}
        onDismiss={() => {
          setContent(null);
        }}
      >
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
          {content}
        </View>
      </Modal>
    </ModalContext.Provider>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
});
