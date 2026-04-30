import React, { useEffect, useMemo, useState } from "react";
import { Breadcrumb } from "app/components";
import { Box } from "@mui/material";
import axios from "axios";
import { Button, Card, Col, Collapse, Empty, Row, Space, Table, Tag, Typography, message } from "antd";
import { getImageUrl } from "app/utils/imageUrl";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import referenceStock from "./inventaireReferenceStock.json";

const { Text } = Typography;
const ARCHIVE_STORAGE_KEY = "wakeup-inventaire-archive-v1";
const HEX_COLOR_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const getVariantDisplayName = (variant) => {
  const parts = [variant?.name, variant?.nom, variant?.reference, variant?.color].filter(Boolean);
  return parts.length ? parts.join(" / ") : "";
};

const formatMoney = (value) => {
  const amount = Math.round(Number(value || 0));
  if (!Number.isFinite(amount)) return "0 TND";
  const grouped = String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped} TND`;
};

const normalizeSession = (session, source) => ({
  id: String(session?._id || session?.id || ""),
  createdAt: session?.createdAt || new Date().toISOString(),
  boxes: Array.isArray(session?.boxes) ? session.boxes : [],
  rows: Array.isArray(session?.rows) ? session.rows : [],
  source
});

const aggregateRowsByBarcode = (rows) => {
  const map = new Map();
  rows.forEach((row) => {
    const barcode = String(row?.barcode || "").trim();
    if (!barcode) return;
    const existing = map.get(barcode);
    if (existing) {
      existing.quantity += Number(row?.quantity) || 0;
      if (row?.box) {
        existing.boxes.add(String(row.box).toUpperCase());
      }
      return;
    }

    map.set(barcode, {
      ...row,
      quantity: Number(row?.quantity) || 0,
      boxes: new Set(row?.box ? [String(row.box).toUpperCase()] : []),
      box: row?.box ? String(row.box).toUpperCase() : "--"
    });
  });

  return Array.from(map.values()).map((item) => ({
    ...item,
    box: item.boxes.size ? Array.from(item.boxes).sort().join(", ") : "--"
  }));
};

const InventaireArchive = () => {
  const [version, setVersion] = useState(0);
  const [apiProducts, setApiProducts] = useState([]);
  const [dbSessions, setDbSessions] = useState([]);
  const [dbLoaded, setDbLoaded] = useState(false);

  const localSessions = useMemo(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(ARCHIVE_STORAGE_KEY) || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed.map((session) => normalizeSession(session, "local"));
    } catch (error) {
      return [];
    }
  }, [version]);

  const sessions = useMemo(() => {
    const map = new Map();
    dbSessions.forEach((session) => map.set(session.id, session));
    localSessions.forEach((session) => {
      if (!map.has(session.id)) {
        map.set(session.id, session);
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [dbSessions, localSessions]);

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

  useEffect(() => {
    const fetchDbSessions = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL_PRODUCTION}api/inventaire/session`,
          {
            headers: { "x-api-key": process.env.REACT_APP_API_KEY }
          }
        );
        const normalized = (response.data?.sessions || []).map((session) =>
          normalizeSession(session, "db")
        );
        setDbSessions(normalized);
      } catch (error) {
        console.warn("Inventaire DB archive unavailable, fallback to local only.");
      } finally {
        setDbLoaded(true);
      }
    };

    fetchDbSessions();
  }, [version]);

  const barcodeDetailsMap = useMemo(() => {
    const map = new Map();
    apiProducts.forEach((product) => {
      const productImageUrl = getImageUrl(product?.mainPicture || "");
      (product.variants || []).forEach((variant) => {
        const barcode = String(variant?.codeAbarre || "").trim();
        if (!barcode) return;
        const variantImageUrl = getImageUrl(variant?.picture || "");
        map.set(barcode, {
          productName: product?.nom || "",
          imageUrl: variantImageUrl || productImageUrl || "",
          variantImageUrl,
          productImageUrl,
          variantColor: variant?.color || "",
          variantName: getVariantDisplayName(variant)
        });
      });
    });
    return map;
  }, [apiProducts]);

  const referenceByBarcodeMap = useMemo(() => {
    const map = new Map();
    const items = Array.isArray(referenceStock?.items) ? referenceStock.items : [];
    items.forEach((item) => {
      const barcode = String(item?.barcode || "").trim();
      if (!barcode) return;
      map.set(barcode, {
        quantity: Number(item?.stock) || 0,
        purchasePrice: Number(item?.purchasePrice) || 0,
        salePrice: Number(item?.salePrice) || 0
      });
    });
    return map;
  }, []);

  const enrichRows = (rows) =>
    rows.map((row) => {
      const details = barcodeDetailsMap.get(String(row.barcode || "").trim());
      const cleanedName = String(row.productName || "")
        .replace(/\s+\/\s+#[0-9a-f]{3,6}/gi, "")
        .trim();
      return {
        ...row,
        displayProductName: cleanedName || details?.productName || row.barcode || "N/A",
        displayImage: details?.imageUrl || "",
        displayVariantImage: details?.variantImageUrl || "",
        displayColor: details?.variantColor || "",
        displayVariant: details?.variantName || ""
      };
    });

  const downloadSessionPdf = (session) => {
    const enrichedRows = enrichRows(Array.isArray(session?.rows) ? session.rows : []);
    const aggregatedRows = aggregateRowsByBarcode(enrichedRows);
    const rows = aggregatedRows
      .map((row) => {
        const barcode = String(row.barcode || "").trim();
        const reference = referenceByBarcodeMap.get(barcode);
        const purchasePrice = Number(reference?.purchasePrice) || 0;
        const salePrice = Number(reference?.salePrice) || 0;
        const quantity = Number(row.quantity) || 0;
        const omarQty = Number(reference?.quantity) || 0;
        return {
          barcode,
          productName: row.displayProductName || row.productName || "N/A",
          variantName: row.displayVariant || "--",
          box: String(row.box || "--"),
          quantity,
          omarQty,
          purchasePrice,
          salePrice,
          totalPurchase: quantity * purchasePrice,
          totalSale: quantity * salePrice
        };
      })
      .sort((a, b) => {
        const boxCompare = a.box.localeCompare(b.box, undefined, { numeric: true, sensitivity: "base" });
        if (boxCompare !== 0) return boxCompare;
        return a.productName.localeCompare(b.productName, undefined, {
          numeric: true,
          sensitivity: "base"
        });
      });

    if (!rows.length) {
      message.warning("Aucune ligne a exporter.");
      return;
    }

    const doc = new jsPDF({ orientation: "portrait" });
    const createdAt = new Date(session?.createdAt || Date.now()).toLocaleString();
    doc.setFontSize(16);
    doc.text("Inventaire Archive - Session", 14, 16);
    doc.setFontSize(11);
    doc.text(`Session: ${createdAt}`, 14, 23);
    doc.text(`Total lignes: ${rows.length}`, 120, 23);
    const totalPurchaseAll = rows.reduce((sum, row) => sum + row.totalPurchase, 0);
    const totalSaleAll = rows.reduce((sum, row) => sum + row.totalSale, 0);

    autoTable(doc, {
      startY: 28,
      margin: { left: 10, right: 10 },
      tableWidth: "auto",
      head: [
        [
          "Product",
          "Variant",
          "Quantity",
          "Difference",
          "Prix Unitaire",
          "Prix Achat",
          "Prix Vente"
        ]
      ],
      body: rows.map((row) => [
        row.productName,
        row.variantName,
        String(row.quantity),
        String(row.quantity - row.omarQty),
        formatMoney(row.salePrice),
        formatMoney(row.totalPurchase),
        formatMoney(row.totalSale)
      ]),
      styles: { fontSize: 9, cellPadding: 3, valign: "middle", minCellHeight: 22 },
      headStyles: { fillColor: [22, 119, 255] },
      columnStyles: {
        0: { cellWidth: 46, halign: "left" },
        1: { cellWidth: 28, halign: "left" },
        2: { cellWidth: 12, halign: "center" },
        3: { cellWidth: 12, halign: "center" },
        4: { cellWidth: 30, halign: "right" },
        5: { cellWidth: 30, halign: "right" },
        6: { cellWidth: 30, halign: "right" }
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 1) {
          data.cell.styles.fontStyle = "bold";
        }
        if (data.section === "body" && data.column.index === 3) {
          const diff = Number(data.cell.raw) || 0;
          if (diff > 0) {
            data.cell.styles.textColor = [56, 158, 13];
            data.cell.text = [`+${diff}`];
            data.cell.styles.fontStyle = "bold";
          } else if (diff < 0) {
            data.cell.styles.textColor = [207, 19, 34];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawCell: (data) => {
        if (data.section !== "body") return;
      }
    });
    const finalY = doc.lastAutoTable?.finalY || 28;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total prix achat: ${formatMoney(totalPurchaseAll)}`, 14, finalY + 10);
    doc.text(`Total prix vente: ${formatMoney(totalSaleAll)}`, 14, finalY + 17);

    doc.save(`inventaire-session-${new Date(session?.createdAt || Date.now()).toISOString().slice(0, 10)}.pdf`);
  };

  const removeSession = (id) => {
    const target = sessions.find((session) => session.id === id);
    if (!target) return;

    const run = async () => {
      try {
        if (target.source === "db") {
          await axios.delete(
            `${process.env.REACT_APP_API_URL_PRODUCTION}api/inventaire/session/${id}`,
            {
              headers: { "x-api-key": process.env.REACT_APP_API_KEY }
            }
          );
        } else {
          const nextLocal = localSessions.filter((session) => session.id !== id);
          localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(nextLocal));
        }
        setVersion((v) => v + 1);
        message.success("Sauvegarde supprimee.");
      } catch (error) {
        message.error("Echec de suppression de la sauvegarde.");
      }
    };

    run();
  };

  const applySessionQuantities = (session) => {
    const run = async () => {
      try {
        const response = await axios.patch(
          `${process.env.REACT_APP_API_URL_PRODUCTION}api/inventaire/session/${session.id}/apply-quantities`,
          {},
          {
            headers: { "x-api-key": process.env.REACT_APP_API_KEY }
          }
        );

        const data = response.data || {};
        message.success(
          `Quantites variants maj: ${data.updatedCount || 0} modifie(s), ${data.unchangedCount || 0} inchange(s).`
        );
        if (Number(data.missingCount) > 0) {
          message.warning(`${data.missingCount} code(s)-barres introuvable(s) cote variants.`);
        }
      } catch (error) {
        message.error("Echec de mise a jour des quantites variants.");
      }
    };

    run();
  };

  const clearArchive = () => {
    const run = async () => {
      try {
        localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify([]));
        if (dbSessions.length) {
          await axios.delete(`${process.env.REACT_APP_API_URL_PRODUCTION}api/inventaire/session`, {
            headers: { "x-api-key": process.env.REACT_APP_API_KEY }
          });
        }
        setVersion((v) => v + 1);
        message.success("Archive videe (local + DB).");
      } catch (error) {
        message.warning("Archive locale videe. Suppression DB indisponible.");
        setVersion((v) => v + 1);
      }
    };

    run();
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
                <td>
                  ${
                    row.displayColor && HEX_COLOR_REGEX.test(row.displayColor)
                      ? `<span class="color-dot" style="background:${row.displayColor};"></span> ${row.displayColor}`
                      : row.displayColor || "--"
                  }
                </td>
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
                  <th>Color</th>
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
            .color-dot { width: 12px; height: 12px; border-radius: 50%; border: 1px solid #999; display: inline-block; vertical-align: middle; margin-right: 6px; }
            img { width: 120px; height: 120px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd; display: block; margin: 0 auto; }
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
      title: "Couleur",
      key: "color",
      width: 130,
      render: (_, record) => {
        const details = barcodeDetailsMap.get(String(record.barcode || "").trim());
        const color = details?.variantColor || "";
        if (!color) return <Text type="secondary">--</Text>;
        return HEX_COLOR_REGEX.test(color) ? (
          <Space size={6}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                border: "1px solid #999",
                background: color,
                display: "inline-block"
              }}
            />
            <Text>{color}</Text>
          </Space>
        ) : (
          <Text>{color}</Text>
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
      title: "qte omar",
      key: "fileQuantity",
      width: 130,
      render: (_, record) => {
        const barcode = String(record?.barcode || "").trim();
        const reference = referenceByBarcodeMap.get(barcode);
        if (!reference) return <Text type="secondary">--</Text>;
        return <Text>{reference.quantity}</Text>;
      }
    },
    {
      title: "Difference",
      key: "difference",
      width: 130,
      render: (_, record) => {
        const barcode = String(record?.barcode || "").trim();
        const reference = referenceByBarcodeMap.get(barcode);
        if (!reference) return <Text type="secondary">--</Text>;
        const inventaireQty = Number(record?.quantity) || 0;
        const fileQty = Number(reference.quantity) || 0;
        const diff = inventaireQty - fileQty;
        if (diff > 0) {
          return <Tag color="success">{`+${diff}`}</Tag>;
        }
        if (diff < 0) {
          return <Tag color="error">{`${diff}`}</Tag>;
        }
        return <Tag>0</Tag>;
      }
    },
    {
      title: "Prix Achat",
      key: "purchasePrice",
      width: 130,
      render: (_, record) => {
        const barcode = String(record?.barcode || "").trim();
        const reference = referenceByBarcodeMap.get(barcode);
        if (!reference) return <Text type="secondary">--</Text>;
        const total = (Number(record?.quantity) || 0) * (Number(reference.purchasePrice) || 0);
        return <Text>{formatMoney(total)}</Text>;
      }
    },
    {
      title: "Prix Vente",
      key: "salePrice",
      width: 130,
      render: (_, record) => {
        const barcode = String(record?.barcode || "").trim();
        const reference = referenceByBarcodeMap.get(barcode);
        if (!reference) return <Text type="secondary">--</Text>;
        const total = (Number(record?.quantity) || 0) * (Number(reference.salePrice) || 0);
        return <Text>{formatMoney(total)}</Text>;
      }
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
            {dbLoaded && <Tag color="purple">DB: {dbSessions.length}</Tag>}
            <Tag color="default">Local: {localSessions.length}</Tag>
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
              const rows = session.rows;
              const aggregatedRows = aggregateRowsByBarcode(enrichRows(rows));
              const boxes = session.boxes;
              const totals = aggregatedRows.reduce(
                (acc, row) => {
                  const barcode = String(row?.barcode || "").trim();
                  const reference = referenceByBarcodeMap.get(barcode);
                  const qty = Number(row?.quantity) || 0;
                  acc.purchase += qty * (Number(reference?.purchasePrice) || 0);
                  acc.sale += qty * (Number(reference?.salePrice) || 0);
                  return acc;
                },
                { purchase: 0, sale: 0 }
              );

              return {
                key: session.id,
                label: (
                  <Row justify="space-between" align="middle" style={{ width: "100%" }}>
                    <Col>
                      <Space>
                        <Text strong>{createdAt}</Text>
                        <Tag>BOX: {boxes.length}</Tag>
                        <Tag>Lignes: {aggregatedRows.length}</Tag>
                        <Tag color={session.source === "db" ? "green" : "default"}>
                          {session.source.toUpperCase()}
                        </Tag>
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
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            applySessionQuantities(session);
                          }}
                        >
                          Update Variants Qty
                        </Button>
                        <Button
                          type="primary"
                          size="small"
                          onClick={async (event) => {
                            event.stopPropagation();
                            await downloadSessionPdf(session);
                          }}
                        >
                          Download PDF
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
                      dataSource={aggregatedRows}
                      pagination={{ pageSize: 8 }}
                      bordered
                    />
                    <Row justify="end" style={{ marginTop: 10 }}>
                      <Space>
                        <Tag color="gold">Total prix achat: {formatMoney(totals.purchase)}</Tag>
                        <Tag color="geekblue">Total prix vente: {formatMoney(totals.sale)}</Tag>
                      </Space>
                    </Row>
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
