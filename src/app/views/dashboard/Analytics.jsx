import { Fragment } from "react";
import { Card, Grid, styled, useTheme } from "@mui/material";
import RowCards from "./shared/RowCards";
import StatCards from "./shared/StatCards";
import Campaigns from "./shared/Campaigns";
import StatCards2 from "./shared/StatCards2";
import DoughnutChart from "./shared/Doughnut";
import UpgradeCard from "./shared/UpgradeCard";
import TopSellingTable from "./shared/TopSellingTable";
import { useEffect, useState } from "react";
import axios from "axios";

// STYLED COMPONENTS
const ContentBox = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" }
}));

const Title = styled("span")(() => ({
  fontSize: "1rem",
  fontWeight: "500",
  marginRight: ".5rem",
  textTransform: "capitalize"
}));

const SubTitle = styled("span")(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary
}));

const H4 = styled("h4")(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: "500",
  marginBottom: "16px",
  textTransform: "capitalize",
  color: theme.palette.text.secondary
}));

export default function Analytics() {
  const { palette } = useTheme();
  const [allData, setData] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          process.env.REACT_APP_API_URL_PRODUCTION + "api/dashboard/",
          {
            headers: {
              "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
            }
          }
        );
        setLoading(false);
        setData(response.data);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return loading ? (
    <div>chargement...</div>
  ) : (
    <Fragment>
      <ContentBox className="analytics">
        <Grid container spacing={3}>
          <Grid item lg={12} md={12} sm={12} xs={12}>
            <StatCards allData={allData} />
            <TopSellingTable allData={allData} />
            <H4>Commandes récentes</H4>
            <RowCards allData={allData} />
          </Grid>
        </Grid>
      </ContentBox>
    </Fragment>
  );
}
