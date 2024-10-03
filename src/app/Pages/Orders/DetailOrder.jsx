import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Button } from "antd";
import axios from "axios";
import { useLocation, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Importation pour l'ajout de tableaux stylisés
import { Box } from "@mui/material";
import { Breadcrumb } from "app/components";

const { Title, Text } = Typography;
const DetailOrder = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disabledCards, setDisabledCards] = useState([]);
  const location = useLocation();
  const orderId = location.state.orderId;
  console.log(orderId);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL_PRODUCTION}api/order/${orderId}`
        );
        console.log(response.data);

        setOrder(response.data.data);
        setDisabledCards(new Array(response.data.data.listeDesProduits.length).fill(false));
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch order details:", error);
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) return <div>Loading...</div>;

  const handleDownloadInvoice = () => {
    const doc = new jsPDF();

    // Ajouter un logo (doit être en base64 ou accessible via URL)
    // const logoUrl = 'http://localhost:3000/assets/img/logo-wakeup.png';
    // doc.addImag(logoUrl, 'PNG', 10, 10, 50, 20); // Position et taille du logo

    // Titre de la facture
    doc.setFontSize(22);
    doc.text("Facture", 105, 40, null, null, "center"); // Aligné au centre
    doc.setFontSize(12);

    // Infos sur le client
    doc.text(`Commande ID: ${orderId}`, 10, 50);
    doc.text(`Nom: ${order.nom} ${order.prenom}`, 10, 60);
    doc.text(`Adresse: ${order.adresse}, ${order.ville}, ${order.gouvernorat}`, 10, 70);
    doc.text(`Code Postal: ${order.codePostal}`, 10, 80);

    // Ligne de séparation
    doc.line(10, 85, 200, 85);

    // Tableau des produits
    const productRows = order.listeDesProduits.map((product, index) => [
      index + 1,
      product?.variant?.reference,
      product.quantite,
      `${product.variant.product.prix || 0} TND`
    ]);

    doc.autoTable({
      head: [["#", "Référence", "Quantité", "Prix"]],
      body: productRows,
      startY: 90,
      styles: { cellPadding: 3, fontSize: 10 },
      headStyles: { fillColor: [0, 123, 255] }
    });

    // Align prices to the right in total section
    const pageWidth = doc.internal.pageSize.getWidth(); // Get the width of the page

    // Ajouter le total et le prix de livraison
    const prixTotalAvecLivraison = order.prixTotal + 8; // Ajout du prix de livraison de 8 TND

    doc.setFontSize(14);

    // Use 'textWidth' to calculate the position to align to the right
    const prixTotalText = `Total Produits: ${order.prixTotal} TND`;
    const livraisonText = `Livraison: 8 TND`;
    const totalGeneralText = `Total Général: ${prixTotalAvecLivraison} TND`;

    // Align the text to the right
    doc.text(
      prixTotalText,
      pageWidth - doc.getTextWidth(prixTotalText) - 10,
      doc.lastAutoTable.finalY + 10
    );
    doc.text(
      livraisonText,
      pageWidth - doc.getTextWidth(livraisonText) - 10,
      doc.lastAutoTable.finalY + 20
    );
    doc.text(
      totalGeneralText,
      pageWidth - doc.getTextWidth(totalGeneralText) - 10,
      doc.lastAutoTable.finalY + 30
    );

    // Enregistrer le PDF
    doc.save(`Facture-${orderId}.pdf`);
  };

  const handleCardToggle = (index) => {
    const newDisabledCards = [...disabledCards];
    newDisabledCards[index] = !newDisabledCards[index]; // Toggle the specific card
    setDisabledCards(newDisabledCards);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "10px" }}>
        <Box className="breadcrumb">
          <Breadcrumb
            routeSegments={[
              { name: "Liste des Commandes", path: "/commande/liste" },
              { name: "Commande" }
            ]}
          />
        </Box>
      </div>
      <Card style={{ marginBottom: "20px" }}>
        <Title level={2}>Détails de la commande pour </Title>

        <p>
          <Text style={{ fontWeight: "700", fontSize: "20px" }}>Nom Prenom :</Text>{" "}
          {order?.nom?.toUpperCase()} {order?.prenom?.toUpperCase()}{" "}
        </p>
        <p>
          <Text style={{ fontWeight: "700", fontSize: "20px" }}>Total Price :</Text>{" "}
          {order?.prixTotal} TND
        </p>
        <p>
          <Text style={{ fontWeight: "700", fontSize: "20px" }}>Address :</Text> {order?.adresse},{" "}
          {order?.ville}, {order?.gouvernorat}, {order?.codePostal}
        </p>
        <Button type="primary" onClick={handleDownloadInvoice}>
          Télécharger la facture
        </Button>
      </Card>
      <Row gutter={[16, 16]}>
        {order.listeDesProduits.map((product, index) => (
          <Col key={index} xs={24} sm={24} md={24} lg={8}>
            <Card
              title={`Product ${index + 1}`}
              bordered={false}
              style={{
                backgroundColor: disabledCards[index] ? "#f0f0f0" : "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%"
              }}
            >
              <div>
                <p>
                  <Text strong>Variant:</Text> {product.variant.reference}
                </p>
                <p>
                  <Text strong>Quantity:</Text> {product.quantite}
                </p>
                <p>
                  <Text strong>Color:</Text>{" "}
                  <span
                    style={{
                      backgroundColor: product.variant.color,
                      padding: "2px 8px",
                      borderRadius: "4px"
                    }}
                  >
                    {product.variant.color}
                  </span>
                </p>
                <p>
                  <Text strong>Description:</Text> {product.variant.product.description}
                </p>
                <p>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <img
                      src={`${process.env.REACT_APP_API_URL_PRODUCTION}${product.variant.picture}`}
                      alt={product.variant.reference}
                      style={{ width: "100%", maxWidth: "100px" }}
                    />
                  </div>
                </p>
              </div>
              <Button onClick={() => handleCardToggle(index)}>
                {disabledCards[index] ? "Enable" : "Disable"}
              </Button>
            </Card>
          </Col>
        ))}

        {order.listeDesPack.map((product, index) => (
          <Col key={index} xs={24} sm={24} md={24} lg={8}>
            <Card
              title={`Product ${index + 1}`}
              bordered={false}
              style={{
                backgroundColor: disabledCards[index] ? "#f0f0f0" : "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%"
              }}
            >
              <div>
                <p>
                  <Text strong>nom du Pack:</Text> {product.pack.nom}
                </p>
                <p>
                  <Text strong>Description:</Text> {product.pack.description}
                </p>
                <p>
                  <Text strong>Image:</Text>{" "}
                  <img
                    src={`${process.env.REACT_APP_API_URL_PRODUCTION}${product.pack.mainPicture}`}
                    // alt={product.variant.reference}
                    style={{ width: "100%", maxWidth: "100px" }}
                  />
                </p>
              </div>
              <Button onClick={() => handleCardToggle(index)}>
                {disabledCards[index] ? "Enable" : "Disable"}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default DetailOrder;
