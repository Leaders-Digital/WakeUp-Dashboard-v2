import React, { useEffect, useMemo, useState } from "react";
import { Breadcrumb } from "app/components";
import { Box } from "@mui/material";
import axios from "axios";
import { Button, Card, Col, Collapse, Empty, Row, Space, Table, Tag, Typography, message } from "antd";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const { Text } = Typography;
const ARCHIVE_STORAGE_KEY = "wakeup-inventaire-archive-v1";
const HEX_COLOR_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const resolveImageUrl = (path) => {
  if (!path) return "";
  const rawPath = String(path).trim();
  if (!rawPath) return "";
  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) return rawPath;

  // Some existing helpers/builders may produce strings like "undefineduploads/..."
  const cleanedPath = rawPath.replace(/^undefined\/?/i, "");
  const normalizedPath = cleanedPath.replace(/^\/+/, "");
  if (!normalizedPath) return "";
  const imageBase = process.env.REACT_APP_API_URL_IMAGE;
  if (imageBase && imageBase !== "undefined") {
    return `${imageBase}${normalizedPath}`;
  }

  const apiBase = process.env.REACT_APP_API_URL_PRODUCTION;
  if (apiBase && apiBase !== "undefined") {
    try {
      const origin = new URL(apiBase).origin;
      return `${origin}/${normalizedPath}`;
    } catch (error) {
      return "";
    }
  }

  return "";
};

const loadImageAsDataUrl = async (url) => {
  if (!url) return "";
  try {
    const response = await fetch(url);
    if (!response.ok) return "";
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    return "";
  }
};

const normalizeSession = (session, source) => ({
  id: String(session?._id || session?.id || ""),
  createdAt: session?.createdAt || new Date().toISOString(),
  boxes: Array.isArray(session?.boxes) ? session.boxes : [],
  rows: Array.isArray(session?.rows) ? session.rows : [],
  source
});

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
      const productImageUrl = resolveImageUrl(product?.mainPicture || "");
      (product.variants || []).forEach((variant) => {
        const barcode = String(variant?.codeAbarre || "").trim();
        if (!barcode) return;
        const variantImageUrl = resolveImageUrl(variant?.picture || "");
        map.set(barcode, {
          productName: product?.nom || "",
          imageUrl: variantImageUrl || productImageUrl || "",
          variantImageUrl,
          productImageUrl,
          variantColor: variant?.color || ""
        });
      });
    });
    return map;
  }, [apiProducts]);

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
        displayColor: details?.variantColor || ""
      };
    });

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

  const exportSessionPdf = async (session) => {
    const rows = enrichRows(Array.isArray(session?.rows) ? session.rows : []);
    const boxes = Array.isArray(session?.boxes) ? session.boxes : [];
    const createdAt = new Date(session.createdAt);

    if (!rows.length) {
      message.warning("Aucune ligne a exporter pour cette session.");
      return;
    }

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const uniqueImages = Array.from(new Set(rows.map((row) => row.displayImage).filter(Boolean)));
    const imageDataByUrl = {};
    await Promise.all(
      uniqueImages.map(async (url) => {
        imageDataByUrl[url] = await loadImageAsDataUrl(url);
      })
    );

    let firstSection = true;
    boxes.forEach((boxName) => {
      const boxRows = rows.filter((row) => row.box === boxName);
      if (!boxRows.length) return;

      if (!firstSection) {
        doc.addPage();
      }
      firstSection = false;

      doc.setFontSize(15);
      doc.text(`Inventaire - BOX ${boxName}`, 14, 14);
      doc.setFontSize(10);
      doc.text(`Session: ${createdAt.toLocaleString()}`, 14, 20);
      doc.text(`Total lignes: ${boxRows.length}`, 14, 25);

      autoTable(doc, {
        startY: 30,
        head: [["Barcode", "Product Name", "Color", "Quantity", "Image"]],
        body: boxRows.map((row) => [
          row.barcode || "",
          row.displayProductName || "",
          row.displayColor || "--",
          String(row.quantity || 0),
          row.displayImage || ""
        ]),
        styles: { fontSize: 9, cellPadding: 2, valign: "middle" },
        headStyles: { fillColor: [22, 119, 255] },
        columnStyles: {
          0: { cellWidth: 36 },
          1: { cellWidth: 58 },
          2: { cellWidth: 28 },
          3: { cellWidth: 20, halign: "center" },
          4: { cellWidth: 42, minCellHeight: 26 }
        },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 4) {
            data.cell.text = [""];
          }
        },
        didDrawCell: (data) => {
          if (data.section !== "body") return;

          if (data.column.index === 2) {
            const colorValue = String(data.cell.raw || "");
            if (HEX_COLOR_REGEX.test(colorValue)) {
              const [r, g, b] = colorValue
                .replace("#", "")
                .match(colorValue.length === 4 ? /./g : /../g)
                .map((hex) => (hex.length === 1 ? hex + hex : hex))
                .map((hex) => parseInt(hex, 16));
              doc.setDrawColor(140, 140, 140);
              doc.setFillColor(r, g, b);
              doc.circle(data.cell.x + 4, data.cell.y + data.cell.height / 2, 1.6, "FD");
            }
          }

          if (data.column.index === 4) {
            const imageUrl = String(data.cell.raw || "");
            const imageData = imageDataByUrl[imageUrl];
            if (!imageData) return;
            try {
              const padding = 1.5;
              doc.addImage(
                imageData,
                "JPEG",
                data.cell.x + padding,
                data.cell.y + padding,
                data.cell.width - padding * 2,
                data.cell.height - padding * 2
              );
            } catch (error) {
              // ignore image draw failure and keep cell text empty
            }
          }
        }
      });
    });

    doc.save(`inventaire-all-boxes-${createdAt.toISOString().slice(0, 10)}.pdf`);
    message.success("PDF genere. Vous pouvez maintenant l'imprimer.");
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
            style={{ width: 68, height: 68, borderRadius: 6, objectFit: "cover", border: "1px solid #eee" }}
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
              const boxes = session.boxes;

              return {
                key: session.id,
                label: (
                  <Row justify="space-between" align="middle" style={{ width: "100%" }}>
                    <Col>
                      <Space>
                        <Text strong>{createdAt}</Text>
                        <Tag>BOX: {boxes.length}</Tag>
                        <Tag>Lignes: {rows.length}</Tag>
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
                            exportSessionPdf(session);
                          }}
                        >
                          Export PDF All BOXES
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
