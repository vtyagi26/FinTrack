import * as React from 'react';
import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import  Alert  from '@mui/material/Alert';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
// import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

// import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from 'react-router-dom';
// import { doc,  updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { useLocation } from 'react-router-dom';
// import { auth, db } from '../Firebase';
// import Copyright from '../components/Copyright';
import { useTransaction } from '../../hooks/transaction';
import { useBalance} from '../../hooks/useBalance';

const theme = createTheme();

export default function SellStock() {
    // const nameRef = useRef();
    // const quantityRef = useRef();
    // const valueRef = useRef();
    // const { currentUser, signup } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const history = useNavigate();
    const location = useLocation();
    const [tradeStatus, setTradeStatus] = useState(true);
    // const {balance, errorBal, bal} = useBalance();

    const {transaction, error, isLoading} = useTransaction();

    const user = JSON.parse(localStorage.getItem("user"));
    console.log(user);
    async function handleSubmit(e) {

        e.preventDefault()
        
        const data = new FormData(e.currentTarget);
        // console.log(currentUser.email)
        
            // const washingtonRef = doc(db, "Stocks", currentUser.email);
            const values = {
                userId: user.id,
                symbol: location.state.symbol,
                name: location.state.name,
                price: location.state.today,
                shares: data.get('quantity'),
                tradeType: "SELL"
                // dates: Timestamp.fromDate(new Date()),
                // value: data.get('value'),
                // quantity: data.get('quantity'),
                // name: location.state.name,
                // symbol: location.state.Symbol
            }
            //console.log(values);
            const transactionStatus = await transaction(user,values);
            console.log(transactionStatus);
            if(transactionStatus){
                setTradeStatus(true);
                // const currbal = await balance();
                history("/portfolio");
            }
            else{
                setTradeStatus(false);
            }
            // history("/watchlist");

    }


    return (
        <ThemeProvider theme={theme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1579226905180-636b76d96082?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8dHJhZGluZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=600&q=60)',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            SELL STOCK
                        </Typography>
                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="name"
                                label="name"
                                name="name"
                                value={location.state.name}
                                autoComplete="name"
                                // ref={nameRef}
                                autoFocus
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="value"
                                label="Value"
                                type="number"
                                id="value"
                                value={location.state.today}
                                autoComplete="value"
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="quantity"
                                label="Quantity"
                                type="number"
                                id="quantity"
                                // ref={quantityRef}
                                autoComplete="quantity"
                            />
                            

                            {/* <InputLabel id="type-label">Type</InputLabel>
                            <Select
                            labelId="type-label"
                            id="type"
                            name="type"
                            // value={age}
                            label="Age"
                            // onChange={handleChange}
                            >
                            <MenuItem value={"BUY"}>BUY</MenuItem>
                            <MenuItem value={"SELL"}>SELL</MenuItem>
                            </Select> */}

                            <Button
                                type="submit"
                                disabled={loading}
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                SELL Stock
                            </Button>
                            {(!tradeStatus)?<Alert severity="error">{error}</Alert>:<></>}
                            <Grid container>
                                <Grid item xs>

                                </Grid>
                                <Grid item>
                                    <Link href="/watchlist" variant="body2">
                                        {"Remove"}
                                    </Link>
                                </Grid>
                            </Grid>
                            {/* <Copyright sx={{ mt: 5 }} /> */}
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}