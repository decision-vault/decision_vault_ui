import { RouterProvider } from "react-router-dom";
import router from "./router/routes";
import { GlobalPrdRunTracker } from "./components/prd/GlobalPrdRunTracker";
import { GlobalSddRunTracker } from "./components/prd/GlobalSddRunTracker";
import { GlobalSchemaRunTracker } from "./components/prd/GlobalSchemaRunTracker";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <GlobalPrdRunTracker />
      <GlobalSddRunTracker />
      <GlobalSchemaRunTracker />
    </>
  );
}

export default App;
