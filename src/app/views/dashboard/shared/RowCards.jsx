import { Fragment } from "react";
import { Box, Fab, Card, Grid, styled, Avatar, Checkbox, IconButton } from "@mui/material";
import { DateRange, MoreVert, StarOutline } from "@mui/icons-material";
import format from "date-fns/format";
import { Span } from "app/components/Typography";
import { useNavigate } from "react-router-dom";
import { EyeOutlined } from "@ant-design/icons";
import "../../../../styles/dashboard.css";
export default function RowCards({ allData }) {
  const navigate = useNavigate();
  return allData.lastFiveEnCoursOrders?.map((oneElement) => (
    <Fragment key={oneElement._id}>
      <Card
        sx={{ py: 1, px: 2 }}
        className="project-card"
        onClick={() => {
          navigate("/commande/details", { state: { orderId: oneElement._id } });
        }}
      >
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

          <Grid item xs={1} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Box display="flex" justifyContent="flex-end">
              {oneElement.listeDesPack.length + oneElement.listeDesProduits.length}
              <span style={{ marginLeft: "10px" }}>produit</span>
            </Box>
            <Grid item md={5} xs={7}>
              <Box display="flex" justifyContent="flex-end">
                <EyeOutlined style={{ fontSize: "18px", cursor: "pointer" }} />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Card>

      <Box py={0.5} />
    </Fragment>
  ));
}
