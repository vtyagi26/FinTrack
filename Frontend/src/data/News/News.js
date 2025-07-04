import * as React from 'react';
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import axios from 'axios';
import NewsCard from '../../Cards/NewsCard';

export default function Quotes() {
  const [news, setNews] = React.useState([]);

  React.useEffect(() => {
    axios
      .get("https://finnhub.io/api/v1/stock/social-sentiment?symbol=GME&token=c94i99aad3if4j50rvn0")
      .then(res => {
        const pData = res.data;
        setNews(pData.reddit);
      });
  }, []);

  const final = news.map((newsItem, index) => (
    <Grid item xs={12} md={6} lg={4} key={index}>
      <Paper
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          height: 450
        }}
      >
        <NewsCard data={newsItem} />
      </Paper>
    </Grid>
  ));

  return <Grid container>{final}</Grid>;
}
