import { Fragment } from "react";
import { Box, Fab, Card, Grid, styled, Avatar, Checkbox, IconButton } from "@mui/material";
import { DateRange, MoreVert, StarOutline } from "@mui/icons-material";
import format from "date-fns/format";
import { Span } from "app/components/Typography";

export default function RowCards({ allData }) {
  console.log(allData.lastFiveEnCoursOrders, "here");

  return allData.lastFiveEnCoursOrders?.map((oneElement) => (
    <Fragment key={oneElement._id}>
      <Card sx={{ py: 1, px: 2 }} className="project-card">
        <Grid container alignItems="center">
          <Grid item md={5} xs={7}>
            {oneElement.nom + " " + oneElement.prenom}
          </Grid>

          <Grid item md={3} xs={4}>
            <Box color="text.secondary">
              {format(new Date(oneElement.createdAt).getTime(), "MM/dd/yyyy hh:mma")}
            </Box>
          </Grid>
          <Grid item xs={3} sx={{ display: { xs: "none", sm: "block" } }}>
            <Box display="flex" position="relative" marginLeft="-0.875rem !important">
              {oneElement.prixTotal + " DT"}
            </Box>
          </Grid>

          <Grid item xs={1}>
            <Box display="flex" justifyContent="flex-end">
              {oneElement.listeDesPack.length + oneElement.listeDesProduits.length} produit
            </Box>
          </Grid>
        </Grid>
      </Card>

      <Box py={1} />
    </Fragment>
  ));
}
