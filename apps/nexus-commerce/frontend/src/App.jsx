// apps/nexus-commerce/frontend/src/App.jsx

import React from "react";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { store } from "./redux/store";
import { queryClient } from "./config/queryClient";
import { AppRouter } from "./routes/Router";
import { ErrorBoundary } from "./components/feedback/ErrorBoundary";

export function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>
        <Toaster
          position="bottom-right"
          theme="dark"
          closeButton
          richColors
          toastOptions={{
            style: {
              background: "#0d111a",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#f8fafc",
              borderRadius: "1rem",
              fontFamily: "Inter, sans-serif",
            },
          }}
        />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
