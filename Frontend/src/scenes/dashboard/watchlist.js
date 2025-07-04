import { Box, useTheme } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Headers";
import { useEffect, useState } from "react";
import axios from "axios";

const Watchlist = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [rows, setRows] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const fetchData = async () => {
    const temp = [];
    const url = "https://finnhub.io/api/v1/calendar/ipo?from=2022-01-01&to=2022-12-31&token=ce80b8aad3i4pjr4v2ggce80b8aad3i4pjr4v2h0";

    try {
      const res = await axios.get(url);
      const pData = res.data["ipoCalendar"];

      if (!pData || !Array.isArray(pData)) {
        console.warn("No IPO data found.");
        setRows([]);
        return;
      }

      pData.slice(0, 50).forEach((item, index) => {
        temp.push({
          id: index,
          date: item.date || "N/A",
          exchange: item.exchange || "N/A",
          name: item.name || "N/A",
          numberOfShares: item.numberOfShares || "N/A",
          price: item.price || "N/A",
          status: item.status || "N/A",
          symbol: item.symbol || "N/A",
          totalSharesValue: item.totalSharesValue || "N/A",
        });
      });

      setRows(temp);
    } catch (err) {
      console.error("Error fetching IPO data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { field: "date", headerName: "Date", flex: 0.5 },
    { field: "exchange", headerName: "Exchange", flex: 0.5 },
    { field: "name", headerName: "Name", flex: 0.5 },
    {
      field: "numberOfShares",
      headerName: "Number Of Shares",
      flex: 0.5,
      type: "number",
    },
    {
      field: "price",
      headerName: "Price",
      flex: 0.5,
      type: "number",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.3,
    },
    {
      field: "symbol",
      headerName: "Symbol",
      flex: 0.3,
    },
    {
      field: "totalSharesValue",
      headerName: "Total Shares Value",
      flex: 0.3,
      type: "number",
    },
  ];

  return (
    <Box m="20px">
      <Header title="IPO" subtitle="View upcoming IPO details here" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
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
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>
    </Box>
  );
};

export default Watchlist;
