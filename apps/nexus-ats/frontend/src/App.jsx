// apps/nexus-ats/frontend/src/App.jsx

import { Provider } from "react-redux";
import { RouterProvider } from "react-router";
import { store } from "@/redux/store";
import { router } from "./routes/Router";

export default function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}
