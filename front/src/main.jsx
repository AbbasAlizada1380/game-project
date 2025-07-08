import App from "./App.jsx";
import "./index.css";
import { store, persistor } from "./state/store.js";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import ThemeProvider from "./components/common/ThemeProvider.jsx";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")).render(
    <PersistGate persistor={persistor}>
      <Provider store={store}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </Provider>
    </PersistGate>
);

