import * as React from "react";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Header from "../../components/Header";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useState } from "react";
import axios from "axios";
import { tokens } from "../../theme";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { rows } from "../../finalStockData";

const Dashboard = () => {
  const { user } = useAuthContext();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const history = useNavigate();

  const columns = [
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "symbol",
      headerName: "Symbol",
      flex: 1,
      cellClassName: "symbol-column--cell",
    },
    {
      field: "figi",
      headerName: "FIGI",
      flex: 1,
      cellClassName: "symbol-column--cell",
    },
    {
      field: "mic",
      headerName: "MIC",
      flex: 1,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "Details",
      headerName: "Add to Watchlist",
      headerAlign: "center",
      align: "center",
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const OnAdd = async (e) => {
          e.stopPropagation();

          const thisRow = {
            description: params.row.description,
            symbol: params.row.symbol,
          };

          const item = {
            userId: user.id,
            symbol: thisRow.symbol,
            name: thisRow.description,
          };

          try {
            await axios.post("http://localhost:8080/temp/", item);
            history("/watchlist", { state: thisRow });
          } catch (err) {
            console.error("Error adding to watchlist:", err);
          }
        };

        return <AddCircleOutlineIcon onClick={OnAdd} style={{ cursor: "pointer", color: "green" }} />;
      },
    },
  ];

  return (
    <>
      <Header
        title="Stock Listings With Symbols"
        subtitle="Welcome to home page"
      />
      <Box m="20px">
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
            "& .name-column--cell": {
              color: colors.greenAccent[300],
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
            getRowId={(row) => row.symbol} // important for unique keys
          />
        </Box>
      </Box>
    </>
  );
};

export default Dashboard;
