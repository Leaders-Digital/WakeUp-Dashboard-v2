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
  IconButton
} from "@mui/material";
import { Paragraph } from "app/components/Typography";
// import { Navigate } from "react-router-dom";
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

const Small = styled("small")(({ bgcolor }) => ({
  width: 50,
  height: 15,
  color: "#fff",
  padding: "2px 8px",
  borderRadius: "4px",
  overflow: "hidden",
  background: bgcolor,
  boxShadow: "0 0 2px 0 rgba(0, 0, 0, 0.12), 0 2px 2px 0 rgba(0, 0, 0, 0.24)"
}));

export default function TopSellingTable({ allData }) {
  const { palette } = useTheme();
  const bgError = palette.error.main;
  const bgPrimary = palette.primary.main;
  const bgSecondary = palette.secondary.main;
  const navigate = useNavigate();
  return (
    <Card elevation={3} sx={{ pt: "20px", mb: 3 }}>
      <CardHeader>
        <Title>Produit à faible disponibilité</Title>
      </CardHeader>

      <Box overflow="auto">
        <ProductTable>
          <TableHead>
            <TableRow>
              <TableCell
                colSpan={4}
                align="left"
                style={{ marginLeft: "10px" }}
                sx={{ px: 5, textTransform: "capitalize" }}
              >
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
            {allData.variantsWithLessThan3Quantity?.map((product, index) => (
              <TableRow
                key={index}
                hover
                onClick={() =>
                  navigate(`/produit/details/`, { state: { productId: product.product._id } })
                }
              >
                <TableCell colSpan={4} align="left" sx={{ px: 5, textTransform: "capitalize" }}>
                  <img
                    src={`${process.env.REACT_APP_API_URL_PRODUCTION}` + product.picture}
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      objectFit: "cover"
                    }}
                  />
                </TableCell>

                <TableCell colSpan={4} align="left" sx={{ px: 5, textTransform: "capitalize" }}>
                  {product?.reference}
                </TableCell>

                <TableCell colSpan={4} align="left" sx={{ px: 5, textTransform: "capitalize" }}>
                  {" "}
                  {product.product.nom}
                </TableCell>
                <TableCell colSpan={4} align="left" sx={{ px: 5, textTransform: "capitalize" }}>
                  {" "}
                  {product.quantity}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </ProductTable>
      </Box>
    </Card>
  );
}

const productList = [
  {
    imgUrl: "/assets/images/products/headphone-2.jpg",
    name: "earphone",
    price: 100,
    available: 15
  },
  {
    imgUrl: "/assets/images/products/headphone-3.jpg",
    name: "earphone",
    price: 1500,
    available: 30
  },
  {
    imgUrl: "/assets/images/products/iphone-2.jpg",
    name: "iPhone x",
    price: 1900,
    available: 35
  },
  {
    imgUrl: "/assets/images/products/iphone-1.jpg",
    name: "iPhone x",
    price: 100,
    available: 0
  },
  {
    imgUrl: "/assets/images/products/headphone-3.jpg",
    name: "Head phone",
    price: 1190,
    available: 5
  }
];
