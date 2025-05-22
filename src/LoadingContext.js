import React, { createContext, useState, useContext, useEffect } from 'react';
import { loadingController } from './loadingController';

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  // Registramos funciones globales para control externo (interceptor)
  useEffect(() => {
    loadingController.register(() => setLoading(true), () => setLoading(false));
  }, []);

  return (
    <LoadingContext.Provider value={{ loading }}>
      {children}
    </LoadingContext.Provider>
  );
};
