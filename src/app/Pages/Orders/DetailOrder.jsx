import React, { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Typography, Button, Tag, message, Descriptions, Table, Avatar, Empty, Badge, Space } from "antd";
import {
  CopyOutlined,
  BarcodeOutlined,
  AppstoreOutlined,
  PictureOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  GiftOutlined,
  NumberOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useLocation, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Importation pour l'ajout de tableaux stylisés
import { Box } from "@mui/material";
import { Breadcrumb } from "app/components";
import logo from "../../../assets/WhatsApp.jpeg";
import { getImageUrl } from "app/utils/imageUrl";

const { Title, Text } = Typography;

const statusColors = {
  "en cours": "orange",
  validé: "blue",
  "Validé": "blue",
  livré: "green",
  annulé: "red",
};

const DetailOrder = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const orderId = location.state.orderId;
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
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch order details:", error);
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const itemRows = useMemo(() => {
    if (!order) return [];
    const variantRows = (order.listeDesProduits || []).map((item, idx) => {
      const prodInfo = item?.variant?.product;
      const unit = prodInfo?.solde
        ? Number(prodInfo.prix) - Number(prodInfo.prix) * (Number(prodInfo.soldePourcentage || 0) / 100)
        : Number(prodInfo?.prix || 0);
      const qty = Number(item?.quantite || 0);
      return {
        key: `v-${idx}`,
        type: "variant",
        index: idx + 1,
        picture: item?.variant?.picture,
        name: prodInfo?.nom || "—",
        reference: item?.variant?.reference || "—",
        barcode: item?.variant?.codeAbarre || null,
        color: item?.variant?.color || null,
        quantity: qty,
        unitPrice: unit,
        total: unit * qty,
        onSale: !!prodInfo?.solde,
        salePercent: Number(prodInfo?.soldePourcentage || 0),
      };
    });
    const packRows = (order.listeDesPack || []).map((p, idx) => {
      const unit = Number(p?.pack?.prix || 0);
      const qty = Number(p?.quantite || 0);
      return {
        key: `p-${idx}`,
        type: "pack",
        index: variantRows.length + idx + 1,
        picture: p?.pack?.mainPicture,
        name: p?.pack?.nom || "—",
        reference: "—",
        barcode: null,
        color: null,
        quantity: qty,
        unitPrice: unit,
        total: unit * qty,
        onSale: false,
        salePercent: 0,
      };
    });
    return [...variantRows, ...packRows];
  }, [order]);

  const copyText = (text, label = "Copié") => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    message.success(`${label}: ${text}`);
  };

  const itemColumns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      width: 48,
      align: "center",
      render: (v) => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Image",
      dataIndex: "picture",
      key: "picture",
      width: 72,
      render: (pic, row) =>
        pic ? (
          <Avatar
            shape="square"
            size={56}
            src={getImageUrl(pic)}
            alt={row.name}
            style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}
          />
        ) : (
          <Avatar shape="square" size={56} icon={<PictureOutlined />} style={{ background: "#fafafa" }} />
        ),
    },
    {
      title: "Produit",
      dataIndex: "name",
      key: "name",
      render: (name, row) => (
        <Space direction="vertical" size={2}>
          <Text strong>{name}</Text>
          <Space size={4} wrap>
            {row.type === "pack" ? (
              <Tag color="purple" icon={<AppstoreOutlined />}>PACK</Tag>
            ) : (
              <Tag color="blue">Variant</Tag>
            )}
            {row.onSale && row.salePercent > 0 && (
              <Tag color="red">-{row.salePercent}%</Tag>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: "Référence",
      dataIndex: "reference",
      key: "reference",
      render: (ref) =>
        ref && ref !== "—" ? (
          <Text code style={{ fontSize: 12 }}>{ref}</Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: (
        <span>
          <BarcodeOutlined style={{ marginRight: 4 }} />
          Code-barres
        </span>
      ),
      dataIndex: "barcode",
      key: "barcode",
      render: (barcode) =>
        barcode ? (
          <Tag
            color="geekblue"
            style={{ fontFamily: "monospace", cursor: "pointer" }}
            onClick={() => copyText(barcode, "Code-barres copié")}
          >
            {barcode} <CopyOutlined style={{ marginLeft: 4 }} />
          </Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Couleur",
      dataIndex: "color",
      key: "color",
      width: 120,
      render: (color) =>
        color ? (
          <Space size={6} align="center">
            <span
              aria-label={color}
              title={color}
              style={{
                display: "inline-block",
                width: 16,
                height: 16,
                borderRadius: "50%",
                border: "1px solid #d9d9d9",
                backgroundColor: color,
              }}
            />
            <Text style={{ fontSize: 12 }}>{color}</Text>
          </Space>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Quantité",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
      render: (q) => <Badge count={q} showZero style={{ backgroundColor: "#1677ff" }} />,
    },
    {
      title: "Prix unit.",
      dataIndex: "unitPrice",
      key: "unitPrice",
      width: 110,
      align: "right",
      render: (v) => <Text>{Number(v || 0).toFixed(2)} TND</Text>,
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      width: 120,
      align: "right",
      render: (v) => <Text strong>{Number(v || 0).toFixed(2)} TND</Text>,
    },
  ];

  if (loading) return <div>Loading...</div>;

  const tableSubtotal =
    order?.merchandiseSubtotal != null
      ? Number(order.merchandiseSubtotal)
      : itemRows.reduce((acc, r) => acc + Number(r.total || 0), 0);
  const tableDiscountAmount = Number(order?.discountAmount || 0);
  const tableTotal = Number(order?.prixTotal || 0);
  const hasTableDiscount = (order?.hasDiscount || order?.cnrpsDiscountApplied) && tableDiscountAmount > 0;



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

    let cursorY = 120;
    // Add promotion information only when active.
    if (order.withOffer) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor('#008000');
      doc.text("Offre: Remise Acheter 2 articles, le 2ème à -60%", 10, 130);
      doc.setTextColor('#000000');
      doc.setFont("helvetica", "normal");
      cursorY = 130;
    }
    if (order.cnrpsDiscountApplied && order.cnrpsCode) {
      cursorY += 10;
      doc.setFont("helvetica", "bold");
      doc.setTextColor('#B8860B');
      doc.text(
        `Code CNRPS: ${order.cnrpsCode}  (Remise ${order.discountPercentApplied}% = -${Number(order.discountAmount || 0).toFixed(2)} TND)`,
        10,
        cursorY
      );
      doc.setTextColor('#000000');
      doc.setFont("helvetica", "normal");
    }

    const dividerY = cursorY + 5;
    doc.line(10, dividerY, 200, dividerY);
    const tableStartY = dividerY + 5;

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
      startY: tableStartY,
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

    const cnrpsDiscountAmount = order.cnrpsDiscountApplied
      ? Number(order.discountAmount || 0)
      : 0;
    const cnrpsDiscountText = cnrpsDiscountAmount > 0
      ? `Remise CNRPS (${order.discountPercentApplied}%): -${cnrpsDiscountAmount.toFixed(2)} TND`
      : "";

    let livraisonText = "";
    let totalGeneralText = "";

    const totalAfterCnrps = Math.max(0, totalPriceWithoutLivraison - cnrpsDiscountAmount);
    if (order.payed) {
      totalGeneralText = `Total à payer: 0 TND`;
    } else {
      livraisonText = `Livraison: 8 TND`;
      const prixTotalAvecLivraison = totalAfterCnrps + 8;
      totalGeneralText = `Total à payer: ${prixTotalAvecLivraison.toFixed(2)} TND`;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");

    let linesBelowTable = 20;

    if (cnrpsDiscountText) {
      doc.setTextColor('#B8860B');
      doc.text(
        cnrpsDiscountText,
        pageWidth - doc.getTextWidth(cnrpsDiscountText) - 10,
        doc.lastAutoTable.finalY + linesBelowTable
      );
      doc.setTextColor('#000000');
      linesBelowTable += 10;
    }

    if (!order.payed) {
      doc.text(
        livraisonText,
        pageWidth - doc.getTextWidth(livraisonText) - 10,
        doc.lastAutoTable.finalY + linesBelowTable
      );
      linesBelowTable += 10;
    }

    doc.text(
      totalGeneralText,
      pageWidth - doc.getTextWidth(totalGeneralText) - 10,
      doc.lastAutoTable.finalY + linesBelowTable
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
      <Card
        style={{ marginBottom: 20 }}
        title={
          <Space size={12} wrap>
            <ShoppingCartOutlined style={{ fontSize: 22, color: "#1677ff" }} />
            <Title level={4} style={{ margin: 0 }}>
              Commande {order?.orderCode}
            </Title>
            {order?.statut && (
              <Tag color={statusColors[order.statut] || "default"} style={{ textTransform: "capitalize" }}>
                {order.statut}
              </Tag>
            )}
            <Tag color={order?.payed ? "green" : "red"} icon={<CreditCardOutlined />}>
              {order?.payed ? "Payé" : "Non payé"}
            </Tag>
            {order?.withOffer && (
              <Tag color="magenta" icon={<GiftOutlined />}>
                2ᵉ article -60%
              </Tag>
            )}
            {order?.cnrpsDiscountApplied && (
              <Tag color="gold">CNRPS -{order.discountPercentApplied}%</Tag>
            )}
          </Space>
        }
        extra={
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadInvoice}>
            Télécharger la facture
          </Button>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              size="small"
              type="inner"
              title={
                <Space>
                  <UserOutlined />
                  <span>Client</span>
                </Space>
              }
            >
              <Descriptions column={1} size="small" colon={false}>
                <Descriptions.Item label={<Text type="secondary">Nom complet</Text>}>
                  <Text strong>
                    {`${order?.nom || ""} ${order?.prenom || ""}`.trim().toUpperCase() || "—"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text type="secondary">
                      <PhoneOutlined /> Téléphone
                    </Text>
                  }
                >
                  {order?.numTelephone ? (
                    <a href={`tel:${order.numTelephone}`}>{order.numTelephone}</a>
                  ) : (
                    "—"
                  )}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text type="secondary">
                      <MailOutlined /> Email
                    </Text>
                  }
                >
                  {order?.email ? (
                    <a href={`mailto:${order.email}`}>{order.email}</a>
                  ) : (
                    "—"
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              size="small"
              type="inner"
              title={
                <Space>
                  <EnvironmentOutlined />
                  <span>Livraison</span>
                </Space>
              }
            >
              <Descriptions column={1} size="small" colon={false}>
                <Descriptions.Item label={<Text type="secondary">Adresse</Text>}>
                  {order?.adresse || "—"}
                </Descriptions.Item>
                <Descriptions.Item label={<Text type="secondary">Ville</Text>}>
                  {order?.ville || "—"}
                </Descriptions.Item>
                <Descriptions.Item label={<Text type="secondary">Gouvernorat</Text>}>
                  {order?.gouvernorat || "—"}
                </Descriptions.Item>
                <Descriptions.Item label={<Text type="secondary">Code postal</Text>}>
                  {order?.codePostal || "—"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              size="small"
              type="inner"
              title={
                <Space>
                  <InfoCircleOutlined />
                  <span>Suivi</span>
                </Space>
              }
            >
              <Descriptions column={1} size="small" colon={false}>
                <Descriptions.Item
                  label={
                    <Text type="secondary">
                      <NumberOutlined /> Code de suivi
                    </Text>
                  }
                >
                  <Text code copyable={{ text: order?.orderCode, tooltips: ["Copier", "Copié !"] }}>
                    {order?.orderCode || "—"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text type="secondary">
                      <CalendarOutlined /> Créée le
                    </Text>
                  }
                >
                  {order?.createdAt
                    ? new Date(order.createdAt).toLocaleString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </Descriptions.Item>
                {order?.updatedAt && order.updatedAt !== order.createdAt && (
                  <Descriptions.Item
                    label={
                      <Text type="secondary">
                        <CalendarOutlined /> Mise à jour
                      </Text>
                    }
                  >
                    {new Date(order.updatedAt).toLocaleString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Descriptions.Item>
                )}
                {order?.paymentRef && (
                  <Descriptions.Item
                    label={
                      <Text type="secondary">
                        <CreditCardOutlined /> Réf. paiement
                      </Text>
                    }
                  >
                    <Text code copyable={{ text: order.paymentRef, tooltips: ["Copier", "Copié !"] }}>
                      {order.paymentRef}
                    </Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>

          {order?.note ? (
            <Col span={24}>
              <Card
                size="small"
                type="inner"
                title={
                  <Space>
                    <FileTextOutlined />
                    <span>Note du client</span>
                  </Space>
                }
              >
                <Text italic style={{ whiteSpace: "pre-wrap" }}>
                  {order.note}
                </Text>
              </Card>
            </Col>
          ) : null}

          {order?.cnrpsDiscountApplied && order?.cnrpsCode ? (
            <Col span={24}>
              <Card
                size="small"
                type="inner"
                style={{ background: "#fffbe6", borderColor: "#ffe58f" }}
                title={
                  <Space>
                    <GiftOutlined style={{ color: "#B8860B" }} />
                    <span style={{ fontWeight: 700 }}>Remise CNRPS appliquée</span>
                    <Tag color="gold">-{order.discountPercentApplied}%</Tag>
                  </Space>
                }
              >
                <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
                  <Descriptions.Item label="Code CNRPS">
                    <Text
                      code
                      copyable={{
                        text: order.cnrpsCode,
                        icon: <CopyOutlined />,
                        tooltips: ["Copier", "Copié !"],
                      }}
                      style={{ fontWeight: 600 }}
                    >
                      {order.cnrpsCode}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Pourcentage">
                    {order.discountPercentApplied}%
                  </Descriptions.Item>
                  <Descriptions.Item label="Montant remise">
                    <Text type="danger">
                      -{Number(order.discountAmount || 0).toFixed(2)} TND
                    </Text>
                  </Descriptions.Item>
                  {order.merchandiseSubtotal != null && (
                    <Descriptions.Item label="Sous-total articles">
                      {Number(order.merchandiseSubtotal).toFixed(2)} TND
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Éligible au checkout">
                    <Tag color={order.cnrpsEligibleAtCheckout ? "green" : "red"}>
                      {order.cnrpsEligibleAtCheckout ? "Oui" : "Non"}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          ) : null}
        </Row>
      </Card>
      <Card
        title={
          <Space>
            <AppstoreOutlined />
            <span>Articles de la commande</span>
            <Badge
              count={itemRows.reduce((acc, r) => acc + Number(r.quantity || 0), 0)}
              showZero
              overflowCount={9999}
              style={{ backgroundColor: "#1677ff" }}
            />
          </Space>
        }
        style={{ marginBottom: 20 }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={itemColumns}
          dataSource={itemRows}
          pagination={false}
          size="middle"
          rowClassName={(row) => (row.type === "pack" ? "row-pack" : "row-variant")}
          locale={{ emptyText: <Empty description="Aucun article" /> }}
          scroll={{ x: "max-content" }}
          summary={(rows) => {
            const totalQty = rows.reduce((acc, r) => acc + Number(r.quantity || 0), 0);
            return (
              <>
                <Table.Summary.Row style={{ background: "#fafafa" }}>
                  <Table.Summary.Cell index={0} colSpan={6} align="right">
                    <Text strong>Total quantité</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="center">
                    <Badge count={totalQty} showZero style={{ backgroundColor: "#52c41a" }} />
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <Text type="secondary">—</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <Text type="secondary">—</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>

                <Table.Summary.Row>
                  <Table.Summary.Cell index={4} colSpan={8} align="right">
                    <Text type="secondary">Sous-total articles</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="right">
                    <Text>{tableSubtotal.toFixed(2)} TND</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>

                {hasTableDiscount && (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={6} colSpan={8} align="right">
                      <Text type="secondary">Remise</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={7} align="right">
                      <Text type="danger">
                        -{tableDiscountAmount.toFixed(2)} TND
                        {order?.discountPercentApplied ? ` (${order.discountPercentApplied}%)` : ""}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}

                <Table.Summary.Row style={{ background: "#f6ffed" }}>
                  <Table.Summary.Cell index={8} colSpan={8} align="right">
                    <Text strong>Prix total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={9} align="right">
                    <Text strong style={{ color: "#1677ff", fontSize: 16 }}>
                      {tableTotal.toFixed(2)} TND
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>

                <Table.Summary.Row>
                  <Table.Summary.Cell index={10} colSpan={8} align="right">
                    <Text type="secondary">Statut paiement</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={11} align="right">
                    <Tag color={order?.payed ? "green" : "red"}>
                      {order?.payed ? "Payé" : "Non payé"}
                    </Tag>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default DetailOrder;
