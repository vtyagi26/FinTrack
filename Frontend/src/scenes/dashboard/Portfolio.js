// REPLACE YOUR EXISTING Portfolio.jsx FILE WITH THIS UPDATED VERSION

import { Box, Typography, useTheme, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Headers";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Paper from "@mui/material/Paper";

const Portfolio = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const history = useNavigate();
  const [rows, setRows] = useState([]);
  const [invAmt, setInvAmt] = useState(0);
  const [currAmt, setCurrAmt] = useState(0);
  const [tProfit, setTProfit] = useState(0);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const url = `http://localhost:8080/portfolio/${user.id}`;

  const fetchData = async () => {
    try {
      const response = await fetch(url);
      const holdings = await response.json();

      const rowData = await Promise.all(
        holdings.map(async (stock) => {
          const quoteURL = `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=c94i99aad3if4j50rvn0`;
          try {
            const res = await axios.get(quoteURL);
            const price = res.data.c;
            const currAmount = stock.shares * price;
            const invAmount = stock.shares * stock.price;
            const profit = currAmount - invAmount;

            return {
              id: stock._id,
              name: stock.name,
              symbol: stock.symbol,
              today: price,
              buyPrice: stock.price,
              shares: stock.shares,
              currAmount,
              invAmount,
              profit,
            };
          } catch (error) {
            console.error("Quote API error:", error);
            return null;
          }
        })
      );

      const filteredRows = rowData.filter((row) => row !== null);
      const totalInv = filteredRows.reduce((sum, row) => sum + row.invAmount, 0);
      const totalCurr = filteredRows.reduce((sum, row) => sum + row.currAmount, 0);
      const totalProf = filteredRows.reduce((sum, row) => sum + row.profit, 0);

      setRows(filteredRows);
      setInvAmt(totalInv);
      setCurrAmt(totalCurr);
      setTProfit(totalProf);
    } catch (error) {
      console.error("Portfolio fetch error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { field: "name", headerName: "Company Name", flex: 1 },
    { field: "symbol", headerName: "Symbol", flex: 0.5 },
    { field: "today", headerName: "Current Price", flex: 0.5 },
    { field: "buyPrice", headerName: "Average Price", flex: 0.5 },
    { field: "shares", headerName: "Quantity", flex: 0.5 },
    { field: "currAmount", headerName: "Current Amount", flex: 0.5 },
    { field: "invAmount", headerName: "Invested Amount", flex: 0.5 },
    { field: "profit", headerName: "Profit/Loss", flex: 0.5 },
    {
      field: "Sell",
      headerName: "Sell",
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            const rowData = params.row;
            history("/sellStock", { state: rowData });
          }}
        >
          Sell
        </Button>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="Portfolio" />
      <Paper elevation={3}>
        <Box display="flex" justifyContent="center" p={5}>
          <Box mx={4} fontWeight="bold" fontSize="x-large">
            Invested Amount:
            <div style={{ color: "blue", textAlign: "center" }}>
              $ {invAmt.toFixed(2)}
            </div>
          </Box>
          <Box mx={4} fontWeight="bold" fontSize="x-large">
            Current Amount:
            <div style={{ color: "blue", textAlign: "center" }}>
              $ {currAmt.toFixed(2)}
            </div>
          </Box>
          <Box mx={4} fontWeight="bold" fontSize="x-large">
            Profit/Loss:
            <div style={{ color: "#03C03C", textAlign: "center" }}>
              $ {tProfit.toFixed(2)}
            </div>
          </Box>
        </Box>
      </Paper>

      <Box m="40px 0 0 0" height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
        }}>
        <DataGrid
          rows={rows}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>
    </Box>
  );
};

export default Portfolio;
