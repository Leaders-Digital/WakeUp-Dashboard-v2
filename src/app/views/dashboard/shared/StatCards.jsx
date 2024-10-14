import { Box, Card, Grid, IconButton, styled, Tooltip, useScrollTrigger } from "@mui/material";
import { AttachMoney, Group, ShoppingCart, Store, ArrowRightAlt } from "@mui/icons-material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import { useEffect, useState } from "react";
import { Small } from "app/components/Typography";
import axios from "axios";

// STYLED COMPONENTS
const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "24px !important",
  background: theme.palette.background.paper,
  [theme.breakpoints.down("sm")]: { padding: "16px !important" }
}));

const ContentBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  "& small": { color: theme.palette.text.secondary },
  "& .icon": { opacity: 0.6, fontSize: "44px", color: theme.palette.primary.main }
}));

const Heading = styled("h6")(({ theme }) => ({
  margin: 0,
  marginTop: "4px",
  fontSize: "14px",
  fontWeight: "500",
  color: theme.palette.primary.main
}));

export default function StatCards({ allData }) {
  const cardList = [
    {
      name: "Vente par mois",
      amount: allData?.monthlyStats?.totalPrice + " DT",
      Icon: AttachMoney
    },
    {
      name: "Vente par semaines",
      amount: allData?.weeklyStats?.totalPrice + " DT",
      Icon: AttachMoney
    },
    {
      name: "Produit en repture de stock",
      amount: allData.variantsWithLessThan3Quantity?.length,
      Icon: ProductionQuantityLimitsIcon
    },
    { name: "Commandes en cours", amount: allData.enCoursOrdersCount, Icon: LocalShippingIcon }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: "24px" }}>
      {cardList.map(({ amount, Icon, name }) => (
        <Grid item xs={12} md={6} key={name}>
          <StyledCard elevation={6}>
            <ContentBox>
              <Icon className="icon" />
              <Box ml="12px">
                <Small>{name}</Small>
                <Heading>{amount}</Heading>
              </Box>
            </ContentBox>
            <Tooltip title="View Details" placement="top">
              <IconButton></IconButton>
            </Tooltip>
          </StyledCard>
        </Grid>
      ))}
    </Grid>
  );
}
