import { RouterProvider } from "react-router";
import { router } from "./routes/Router";

export default function App() {
  return <RouterProvider router={router} />;
}
