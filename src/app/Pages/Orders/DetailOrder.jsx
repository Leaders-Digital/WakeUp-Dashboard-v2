import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Button } from "antd";
import axios from "axios";
import { useLocation, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Importation pour l'ajout de tableaux stylisés
import { Box } from "@mui/material";
import { Breadcrumb } from "app/components";
import logo from "../../../assets/WhatsApp.jpeg";

const { Title, Text } = Typography;
const DetailOrder = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disabledCards, setDisabledCards] = useState([]);
  const location = useLocation();
  const orderId = location.state.orderId;
  console.log(order, "oreder is here");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL_PRODUCTION}api/order/${orderId}`,
          {
            headers: {
              "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
            }
          }
        );
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

    // Add Company Logo
    doc.addImage(logo, "jpeg", 8, 8, 50, 15);

    // Title "Bon de livraison"
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Bon de livraison", 105, 30, { align: "center" });

    doc.setLineWidth(0.5);
    doc.line(10, 35, 200, 35);

    // Format Date
    const formattedDateTime = new Date(order.createdAt).toLocaleString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    // Order Information Section
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    doc.text(`Commande ID: ${order.orderCode}`, 10, 50);
    doc.text(`Nom: ${order.nom} ${order.prenom}`, 10, 60);
    doc.text(`Adresse: ${order.adresse}`, 10, 70);
    doc.text(`Gouvernorat: ${order.gouvernorat}`, 10, 80);
    doc.text(`Ville: ${order.ville}`, 10, 90);
    doc.text(`Code Postal: ${order.codePostal}`, 10, 100);
    doc.text(`Téléphone: ${order.numTelephone}`, 10, 110);
    doc.text(`Date de Commande: ${formattedDateTime}`, 10, 120);

    // Add Promotion Information
    doc.setFont("helvetica", "bold");
    if (order.withOffer) {
      doc.setTextColor('#008000'); // Green for active promotion
    } else {
      doc.setTextColor('#FF0000'); // Red for inactive promotion
    }
    doc.text(`Offre: ${order.withOffer ? "Remise Acheter 2 articles, le 2ème à -60%" : "Non"}`, 10, 130);
    doc.setTextColor('#000000'); // Reset text color to black
    doc.setFont("helvetica", "normal");

    doc.line(10, 135, 200, 135);

    let productRows = [];
    let totalQuantity = 0;
    let totalPriceWithoutLivraison = 0;

    // If there are products in the order
    if (order.listeDesProduits.length > 0) {
      // Create a flat array of all items with their quantities
      const allItems = order.listeDesProduits.flatMap(product => {
        const prixFinal = product?.variant?.product?.solde
          ? product.variant.product.prix - (product.variant.product.prix * (product.variant.product.soldePourcentage / 100))
          : product.variant.product.prix;

        return Array(product.quantite).fill({
          product,
          prixFinal
        });
      });

      // Sort items by price in descending order (highest first)
      allItems.sort((a, b) => b.prixFinal - a.prixFinal);

      // Process items for the invoice
      productRows = allItems.map((item, index) => {
        let price = item.prixFinal;
        let discountApplied = false;

        // Apply 60% discount only to the second most expensive item
        if (order.withOffer && index === 1) {
          price = item.prixFinal * 0.4;
          discountApplied = true;
        }

        totalPriceWithoutLivraison += price;

        return [
          index + 1,
          item.product.variant.product.nom,
          item.product.variant.reference,
          1, // Quantity is always 1 in the flattened array
          `${price.toFixed(2)} TND`,
          discountApplied ? "60% OFF" : ""
        ];
      });
    }

    // If there are packs in the order
    if (order.listeDesPack.length > 0) {
      productRows = order.listeDesPack.map((pack, index) => {
        const price = pack.pack.prix || 0;
        totalQuantity += pack.quantite;
        totalPriceWithoutLivraison += price * pack.quantite;

        return [
          index + 1,
          pack.pack.nom,
          "PACK",
          pack.quantite,
          `${price} TND`,
          ""
        ];
      });
    }

    // Add Total Row
    productRows.push([
      "Total",
      "",
      "",
      totalQuantity,
      `${totalPriceWithoutLivraison.toFixed(2)} TND`,
      ""
    ]);

    // Product Table Heading
    doc.autoTable({
      head: [["#", "Produit", "Référence", "Quantité", "Prix (TND)", "Remise"]],
      body: productRows,
      startY: 140,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: {
        fillColor: [222, 140, 6],
        textColor: [255, 255, 255],
        fontStyle: "bold"
      },
      bodyStyles: {
        lineColor: [44, 62, 80],
        lineWidth: 0.2
      },
      columnStyles: {
        0: { halign: "center" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "center" }
      }
    });

    // Define pageWidth for right-align calculations
    const pageWidth = doc.internal.pageSize.getWidth();

    let livraisonText = "";
    let totalGeneralText = "";

    if (order.payed) {
      totalGeneralText = `Total à payer: 0 TND`;
    } else {
      livraisonText = `Livraison: 8 TND`;
      const prixTotalAvecLivraison = totalPriceWithoutLivraison + 8;
      totalGeneralText = `Total à payer: ${prixTotalAvecLivraison.toFixed(2)} TND`;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");

    if (!order.payed) {
      doc.text(
        livraisonText,
        pageWidth - doc.getTextWidth(livraisonText) - 10,
        doc.lastAutoTable.finalY + 20
      );
    }

    doc.text(
      totalGeneralText,
      pageWidth - doc.getTextWidth(totalGeneralText) - 10,
      doc.lastAutoTable.finalY + (order.payed ? 20 : 30)
    );

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150);
    doc.text("Merci pour votre achat!", 105, 285, { align: "center" });
    doc.text(
      "Pour toute question, veuillez nous contacter au contact@leaders-makeup.com",
      105,
      290,
      { align: "center" }
    );

    doc.save(`Facture-${order.orderCode}.pdf`);
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
          <Text style={{ fontWeight: "700", fontSize: "20px" }}>Nom et Prenom :</Text>{" "}
          {order?.nom?.toUpperCase()} {order?.prenom?.toUpperCase()}{" "}
        </p>
        <p>
          <Text style={{ fontWeight: "700", fontSize: "20px" }}>Prix Total :</Text>{" "}
          {order?.prixTotal} TND
        </p>
        <p>
          <Text style={{ fontWeight: "700", fontSize: "20px" }}>Telephone :</Text>{" "}
          {order?.numTelephone}
        </p>
        <p>
          <Text style={{ fontWeight: "700", fontSize: "20px" }}>Addresse :</Text> {order?.adresse},{" "}
          {order?.ville}, {order?.gouvernorat}, {order?.codePostal}
        </p>

        <p>
          <Text style={{ fontWeight: "700", fontSize: "20px" }}>Code de Suivie :</Text>{" "}
          {order?.orderCode}{" "}
        </p>
        <p style={{ fontWeight: "700", fontSize: "20px", color: order?.withOffer ? "green" : "red" }}  >
          <Text style={{ fontWeight: "700", fontSize: "20px" }}>Offre :</Text>{" "}
          {order?.withOffer ? "Remise Acheter 2 articles, le 2ème à -60%" : "Non"}
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
                  <Text strong>Description:</Text> {product?.variant?.product?.description}
                </p>
                <p>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <img
                      src={`${process.env.REACT_APP_API_URL_PRODUCTION}${product?.variant?.picture}`}
                      alt={product?.variant?.reference}
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
                  <Text strong>nom du Pack:</Text> {product?.pack?.nom}
                </p>
                <p>
                  <Text strong>Description:</Text> {product?.pack?.description}
                </p>
                <p>
                  <Text strong>Image:</Text>{" "}
                  <img
                    src={`${process.env.REACT_APP_API_URL_PRODUCTION}${product?.pack?.mainPicture}`}
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
