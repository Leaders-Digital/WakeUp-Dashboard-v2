import { Edit } from "@mui/icons-material";
import {
  Box,
  Card,
  Table,
  Select,
  Avatar,
  styled,
  TableRow,
  useTheme,
  MenuItem,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  Pagination,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// STYLED COMPONENTS
const CardHeader = styled(Box)(() => ({
  display: "flex",
  paddingLeft: "24px",
  paddingRight: "24px",
  marginBottom: "12px",
  alignItems: "center",
  justifyContent: "space-between"
}));

const Title = styled("span")(() => ({
  fontSize: "1rem",
  fontWeight: "500",
  textTransform: "capitalize"
}));

const ProductTable = styled(Table)(() => ({
  minWidth: 400,
  whiteSpace: "pre",
  "& small": {
    width: 50,
    height: 15,
    borderRadius: 500,
    boxShadow: "0 0 2px 0 rgba(0, 0, 0, 0.12), 0 2px 2px 0 rgba(0, 0, 0, 0.24)"
  },
  "& td": { borderBottom: "none" },
  "& td:first-of-type": { paddingLeft: "16px !important" }
}));

export default function TopSellingTable({ allData }) {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate total pages
  const totalPages = Math.ceil(allData.variantsWithLessThan3Quantity.length / itemsPerPage);

  // Pagination data
  const paginatedData = allData.variantsWithLessThan3Quantity.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Card elevation={3} sx={{ pt: "20px", mb: 3 }}>
      <CardHeader>
        <Title>Produit à faible disponibilité</Title>
      </CardHeader>

      <Box overflow="auto">
        <ProductTable>
          <TableHead>
            <TableRow>
              <TableCell colSpan={4} align="left" sx={{ px: 5, textTransform: "capitalize" }}>
                Picture
              </TableCell>
              <TableCell colSpan={4} align="left" sx={{ px: 5, textTransform: "capitalize" }}>
                Reference
              </TableCell>
              <TableCell colSpan={4} align="left" sx={{ px: 5, textTransform: "capitalize" }}>
                Nom du produit
              </TableCell>
              <TableCell colSpan={4} align="left" sx={{ px: 5, textTransform: "capitalize" }}>
                Quantité
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.map((product, index) => (
              <TableRow
                key={index}
                hover
                onClick={() => navigate(`/produit/details/`, { state: { productId: product.product._id } })}
              >
                <TableCell colSpan={4} align="left" sx={{ px: 5, textTransform: "capitalize" }}>
                  <Avatar
                    src={`${process.env.REACT_APP_API_URL_PRODUCTION}${product.picture}`}
                    alt={product?.product?.nom}
                    sx={{ width: 50, height: 50 }}
                  />
                </TableCell>

                <TableCell colSpan={4} align="left" sx={{ px: 5, textTransform: "capitalize" }}>
                  {product?.reference}
                </TableCell>

                <TableCell colSpan={4} align="left" sx={{ px: 5, textTransform: "capitalize" }}>
                  {product?.product?.nom}
                </TableCell>

                <TableCell colSpan={4} align="left" sx={{ px: 5, textTransform: "capitalize" }}>
                  {product?.quantity}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </ProductTable>
      </Box>

      {/* Pagination Control */}
      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handleChangePage}
          color="primary"
        />
      </Box>
    </Card>
  );
}
