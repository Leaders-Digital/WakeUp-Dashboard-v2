import React, { useEffect, useMemo, useState } from "react";
import { Breadcrumb } from "app/components";
import { Box } from "@mui/material";
import axios from "axios";
import { Button, Card, Col, Collapse, Empty, Row, Space, Table, Tag, Typography, message } from "antd";
import { getImageUrl } from "app/utils/imageUrl";

const { Text } = Typography;
const ARCHIVE_STORAGE_KEY = "wakeup-inventaire-archive-v1";

const InventaireArchive = () => {
  const [version, setVersion] = useState(0);
  const [apiProducts, setApiProducts] = useState([]);

  const sessions = useMemo(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(ARCHIVE_STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }, [version]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL_PRODUCTION}api/product/all/dashboard`,
          {
            headers: { "x-api-key": process.env.REACT_APP_API_KEY }
          }
        );
        setApiProducts(response.data?.products || []);
      } catch (error) {
        message.error("Impossible de charger les produits pour enrichir l'archive.");
      }
    };

    fetchProducts();
  }, []);

  const barcodeDetailsMap = useMemo(() => {
    const map = new Map();
    apiProducts.forEach((product) => {
      const imageUrl = getImageUrl(product?.mainPicture || "");
      (product.variants || []).forEach((variant) => {
        const barcode = String(variant?.codeAbarre || "").trim();
        if (!barcode) return;
        map.set(barcode, {
          productName: product?.nom || "",
          imageUrl
        });
      });
    });
    return map;
  }, [apiProducts]);

  const enrichRows = (rows) =>
    rows.map((row) => {
      const details = barcodeDetailsMap.get(String(row.barcode || "").trim());
      return {
        ...row,
        displayProductName: row.productName || details?.productName || row.barcode || "N/A",
        displayImage: details?.imageUrl || ""
      };
    });

  const removeSession = (id) => {
    const next = sessions.filter((session) => session.id !== id);
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(next));
    setVersion((v) => v + 1);
    message.success("Sauvegarde supprimee.");
  };

  const clearArchive = () => {
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify([]));
    setVersion((v) => v + 1);
    message.success("Archive videe.");
  };

  const printSessionBoxes = (session) => {
    const rows = enrichRows(Array.isArray(session?.rows) ? session.rows : []);
    const boxes = Array.isArray(session?.boxes) ? session.boxes : [];
    const createdAt = new Date(session.createdAt).toLocaleString();
    const printWindow = window.open("", "_blank", "width=1200,height=800");

    if (!printWindow) {
      message.error("Popup bloquee. Autorisez les popups pour imprimer.");
      return;
    }

    const sectionsHtml = boxes
      .map((boxName) => {
        const boxRows = rows.filter((row) => row.box === boxName);
        if (!boxRows.length) return "";

        const rowsHtml = boxRows
          .map(
            (row) => `
              <tr>
                <td>${row.barcode || ""}</td>
                <td>${row.displayProductName || ""}</td>
                <td class="qty">${row.quantity || 0}</td>
                <td>
                  ${
                    row.displayImage
                      ? `<img src="${row.displayImage}" alt="${row.displayProductName}" />`
                      : `<span class="no-image">No image</span>`
                  }
                </td>
              </tr>
            `
          )
          .join("");

        return `
          <section class="box-section">
            <h2>BOX ${boxName}</h2>
            <table>
              <thead>
                <tr>
                  <th>Barcode</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Image</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </section>
        `;
      })
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Inventaire ${createdAt}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #111; }
            h1 { margin: 0 0 8px; }
            .meta { margin-bottom: 14px; color: #444; }
            .box-section { margin-bottom: 24px; page-break-inside: avoid; }
            h2 { margin: 0 0 8px; padding-bottom: 4px; border-bottom: 1px solid #ddd; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; vertical-align: middle; }
            th { background: #f5f5f5; text-align: left; }
            .qty { text-align: center; font-weight: 700; }
            img { width: 58px; height: 58px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd; }
            .no-image { color: #888; font-size: 11px; }
            @media print { .box-section { page-break-after: always; } .box-section:last-child { page-break-after: auto; } }
          </style>
        </head>
        <body>
          <h1>Inventaire - All BOXES</h1>
          <div class="meta">Session: ${createdAt}</div>
          ${sectionsHtml || "<p>No rows to print.</p>"}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 350);
  };

  const columns = [
    {
      title: "Barcode",
      dataIndex: "barcode",
      key: "barcode"
    },
    {
      title: "Article",
      dataIndex: "productName",
      key: "productName",
      render: (value, record) => {
        const details = barcodeDetailsMap.get(String(record.barcode || "").trim());
        return value || details?.productName || <Text type="secondary">{record.barcode}</Text>;
      }
    },
    {
      title: "Image",
      key: "image",
      width: 90,
      render: (_, record) => {
        const details = barcodeDetailsMap.get(String(record.barcode || "").trim());
        if (!details?.imageUrl) return <Text type="secondary">--</Text>;
        return (
          <img
            src={details.imageUrl}
            alt={record.productName || details.productName || "product"}
            style={{ width: 48, height: 48, borderRadius: 6, objectFit: "cover", border: "1px solid #eee" }}
          />
        );
      }
    },
    {
      title: "Quantite",
      dataIndex: "quantity",
      key: "quantity",
      width: 120
    },
    {
      title: "BOX",
      dataIndex: "box",
      key: "box",
      width: 120,
      render: (value) => <Tag color="blue">{value}</Tag>
    }
  ];

  return (
    <div style={{ padding: 20 }}>
      <Box className="breadcrumb" style={{ marginBottom: 16 }}>
        <Breadcrumb
          routeSegments={[
            { name: "Inventaire", path: "/inventaire" },
            { name: "Archive", path: "/inventaire/archive" }
          ]}
        />
      </Box>

      <Card
        title="Inventaire Archive"
        extra={
          <Space>
            <Tag color="processing">Sessions: {sessions.length}</Tag>
            <Button danger onClick={clearArchive} disabled={!sessions.length}>
              Vider archive
            </Button>
          </Space>
        }
      >
        {!sessions.length ? (
          <Empty description="Aucune sauvegarde inventaire pour le moment." />
        ) : (
          <Collapse
            accordion
            items={sessions.map((session) => {
              const createdAt = new Date(session.createdAt).toLocaleString();
              const rows = Array.isArray(session.rows) ? session.rows : [];
              const boxes = Array.isArray(session.boxes) ? session.boxes : [];

              return {
                key: session.id,
                label: (
                  <Row justify="space-between" align="middle" style={{ width: "100%" }}>
                    <Col>
                      <Space>
                        <Text strong>{createdAt}</Text>
                        <Tag>BOX: {boxes.length}</Tag>
                        <Tag>Lignes: {rows.length}</Tag>
                      </Space>
                    </Col>
                    <Col>
                      <Space>
                        <Button
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            printSessionBoxes(session);
                          }}
                        >
                          Print All BOXES
                        </Button>
                        <Button
                          danger
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeSession(session.id);
                          }}
                        >
                          Supprimer
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                ),
                children: (
                  <div>
                    <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
                      {boxes.map((boxName) => {
                        const boxRows = rows.filter((row) => row.box === boxName);
                        const totalQty = boxRows.reduce(
                          (total, row) => total + (Number(row.quantity) || 0),
                          0
                        );
                        return (
                          <Col key={boxName}>
                            <Tag color="cyan">{`BOX ${boxName}: ${boxRows.length} articles / ${totalQty} qte`}</Tag>
                          </Col>
                        );
                      })}
                    </Row>
                    <Table
                      rowKey={(record) => `${session.id}-${record.key}`}
                      columns={columns}
                      dataSource={rows}
                      pagination={{ pageSize: 8 }}
                      bordered
                    />
                  </div>
                )
              };
            })}
          />
        )}
      </Card>
    </div>
  );
};

export default InventaireArchive;
