function calculateCurrentWeights(holdings) {
  if (!holdings || holdings.length === 0) {
    throw new Error("No holdings found for portfolio optimization");
  }

  const cleanedHoldings = holdings
    .filter((holding) => {
      return (
        holding.ticker &&
        Number(holding.quantity) > 0 &&
        Number(holding.currentPrice) > 0
      );
    })
    .map((holding) => ({
      ticker: holding.ticker.toUpperCase(),
      quantity: Number(holding.quantity),
      currentPrice: Number(holding.currentPrice)
    }));

  if (cleanedHoldings.length < 2) {
    throw new Error("At least 2 valid holdings are required for portfolio optimization");
  }

  const totalValue = cleanedHoldings.reduce((sum, holding) => {
    return sum + holding.quantity * holding.currentPrice;
  }, 0);

  if (totalValue <= 0) {
    throw new Error("Total portfolio value must be greater than 0");
  }

  const currentWeights = {};

  cleanedHoldings.forEach((holding) => {
    const positionValue = holding.quantity * holding.currentPrice;
    currentWeights[holding.ticker] = positionValue / totalValue;
  });

  return {
    currentWeights,
    totalValue,
    tickers: cleanedHoldings.map((holding) => holding.ticker),
    holdings: cleanedHoldings
  };
}

export default calculateCurrentWeights;