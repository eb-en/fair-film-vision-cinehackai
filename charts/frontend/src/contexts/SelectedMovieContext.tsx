import { createContext, useContext, useState, ReactNode } from "react";
import { storage } from "@/utils/storage";

interface SelectedMovieContextType {
  selectedMovieId: string | null;
  setSelectedMovieId: (id: string | null) => void;
}

const SelectedMovieContext = createContext<SelectedMovieContextType | undefined>(undefined);

export const SelectedMovieProvider = ({ children }: { children: ReactNode }) => {
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(() => {
    return storage.getSelectedMovieId();
  });

  const handleSetSelectedMovieId = (id: string | null) => {
    setSelectedMovieId(id);
    storage.setSelectedMovieId(id);
  };

  return (
    <SelectedMovieContext.Provider value={{ selectedMovieId, setSelectedMovieId: handleSetSelectedMovieId }}>
      {children}
    </SelectedMovieContext.Provider>
  );
};

export const useSelectedMovie = () => {
  const context = useContext(SelectedMovieContext);
  if (!context) {
    throw new Error("useSelectedMovie must be used within SelectedMovieProvider");
  }
  return context;
};
