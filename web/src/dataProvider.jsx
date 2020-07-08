import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import configureStore from "./scripts/redux/configureStore";
import Data from "./components/_data";

const { store, persistor } = configureStore();

const DataProvider = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Data />
        {children}
      </PersistGate>
    </Provider>
  );
};

export default DataProvider;
