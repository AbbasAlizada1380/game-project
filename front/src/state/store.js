import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./userSlice/userSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from 'redux-persist';
import themeReducer from "./Theme/themeSlice";

const rootReducer = combineReducers({
  user: userReducer,
  theme: themeReducer,
 
});

const persistConfig = {
  key: "root",
  storage,
  version: 1,
};

const persisteReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persisteReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({serializableCheck:false})
});

export const persistor=persistStore(store)
