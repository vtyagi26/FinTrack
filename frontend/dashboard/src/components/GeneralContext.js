import React, { createContext, useContext, useState } from "react";
import BuyActionWindow from "./BuyActionWindow";
import SellActionWindow from "./SellActionWindow";

const GeneralContext = createContext({
  openBuyWindow: (uid) => {},
  openSellWindow: (uid) => {},
  closeActionWindow: () => {},
});

export const GeneralContextProvider = ({ children }) => {
  const [windowType, setWindowType] = useState(null); // "BUY" or "SELL"
  const [selectedStockUID, setSelectedStockUID] = useState("");

  const openBuyWindow = (uid) => {
    setWindowType("BUY");
    setSelectedStockUID(uid);
  };

  const openSellWindow = (uid) => {
    setWindowType("SELL");
    setSelectedStockUID(uid);
  };

  const closeActionWindow = () => {
    setWindowType(null);
    setSelectedStockUID("");
  };

  return (
    <GeneralContext.Provider
      value={{
        openBuyWindow,
        openSellWindow,
        closeActionWindow,
      }}
    >
      {children}
      {windowType === "BUY" && <BuyActionWindow uid={selectedStockUID} />}
      {windowType === "SELL" && <SellActionWindow uid={selectedStockUID} />}
    </GeneralContext.Provider>
  );
};

export const useGeneralContext = () => useContext(GeneralContext);
export default GeneralContext;