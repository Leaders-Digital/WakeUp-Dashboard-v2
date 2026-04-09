import React, { useEffect, useMemo, useRef, useState } from "react";
import { Breadcrumb } from "app/components";
import { Box } from "@mui/material";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const { Text } = Typography;

const BOX_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const STORAGE_KEY = "wakeup-inventaire-state-v1";
const ARCHIVE_STORAGE_KEY = "wakeup-inventaire-archive-v1";

const getNextBoxName = (existingBoxes) => {
  const normalized = new Set(existingBoxes.map((box) => box.toUpperCase()));
  for (let i = 0; i < BOX_ALPHABET.length; i += 1) {
    const candidate = BOX_ALPHABET[i];
    if (!normalized.has(candidate)) return candidate;
  }

  return `BOX-${existingBoxes.length + 1}`;
};

const getVariantLabel = (variant) => {
  const parts = [variant?.reference, variant?.color].filter(Boolean);
  return parts.length ? `(${parts.join(" / ")})` : "";
};

const Inventaire = () => {
  const scanInputRef = useRef(null);
  const scanResetTimerRef = useRef(null);
  const autoSubmitTimerRef = useRef(null);
  const [apiProducts, setApiProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [scanValue, setScanValue] = useState("");
  const [boxes, setBoxes] = useState(["A"]);
  const [currentBox, setCurrentBox] = useState("A");
  const [rows, setRows] = useState([]);
  const [lastScannedKey, setLastScannedKey] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed?.boxes) && parsed.boxes.length) {
        setBoxes(parsed.boxes);
      }
      if (typeof parsed?.currentBox === "string" && parsed.currentBox) {
        setCurrentBox(parsed.currentBox);
      }
      if (Array.isArray(parsed?.rows)) {
        setRows(parsed.rows);
      }
    } catch (error) {
      console.error("Error while restoring inventaire state:", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        boxes,
        currentBox,
        rows
      })
    );
  }, [boxes, currentBox, rows]);

  useEffect(() => {
    if (scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (autoSubmitTimerRef.current) {
        clearTimeout(autoSubmitTimerRef.current);
      }
      if (scanResetTimerRef.current) {
        clearTimeout(scanResetTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL_PRODUCTION}api/product/all/dashboard`,
          {
            headers: { "x-api-key": process.env.REACT_APP_API_KEY }
          }
        );
        setApiProducts(response.data?.products || []);
      } catch (error) {
        message.error("Impossible de charger les produits.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const barcodeMap = useMemo(() => {
    const map = new Map();
    apiProducts.forEach((product) => {
      (product.variants || []).forEach((variant) => {
        if (!variant?.codeAbarre) return;
        map.set(String(variant.codeAbarre).trim(), {
          productName: product?.nom || "",
          variantLabel: getVariantLabel(variant)
        });
      });
    });
    return map;
  }, [apiProducts]);

  const summaryByBox = useMemo(() => {
    const grouped = {};
    boxes.forEach((box) => {
      grouped[box] = rows.filter((row) => row.box === box);
    });
    return grouped;
  }, [boxes, rows]);

  const currentBoxRows = useMemo(
    () => rows.filter((row) => row.box === currentBox),
    [rows, currentBox]
  );

  const keepScannerFocused = () => {
    setTimeout(() => {
      scanInputRef.current?.focus();
    }, 0);
  };

  const addBox = () => {
    const newBox = getNextBoxName(boxes);
    setBoxes((prev) => [...prev, newBox]);
    setCurrentBox(newBox);
    keepScannerFocused();
  };

  const handleScan = (rawBarcode) => {
    const barcode = String(rawBarcode || "").trim();
    if (!barcode) return;

    const rowKey = `${currentBox}__${barcode}`;
    const found = barcodeMap.get(barcode);

    setRows((prevRows) => {
      const existingIndex = prevRows.findIndex((row) => row.key === rowKey);
      if (existingIndex >= 0) {
        const next = [...prevRows];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: (next[existingIndex].quantity || 0) + 1
        };
        return next;
      }

      return [
        ...prevRows,
        {
          key: rowKey,
          barcode,
          productName: found ? `${found.productName} ${found.variantLabel}`.trim() : "",
          quantity: 1,
          box: currentBox,
          foundInDb: Boolean(found)
        }
      ];
    });

    setLastScannedKey(rowKey);
    if (scanResetTimerRef.current) {
      clearTimeout(scanResetTimerRef.current);
    }
    scanResetTimerRef.current = setTimeout(() => {
      setLastScannedKey(null);
    }, 1200);
  };

  const submitScanValue = (value) => {
    handleScan(value);
    setScanValue("");
    keepScannerFocused();
  };

  const onScanInputChange = (value) => {
    setScanValue(value);

    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current);
    }

    autoSubmitTimerRef.current = setTimeout(() => {
      if (value?.trim()) {
        submitScanValue(value);
      }
    }, 120);
  };

  const updateRowName = (key, value) => {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, productName: value } : row))
    );
  };

  const removeRow = (key) => {
    setRows((prev) => prev.filter((row) => row.key !== key));
    keepScannerFocused();
  };

  const exportPdf = () => {
    const boxRows = rows.filter((row) => row.box === currentBox);
    if (!boxRows.length) {
      message.warning("Aucune ligne à exporter.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Inventaire - BOX ${currentBox}`, 14, 18);
    doc.setFontSize(11);
    doc.text(`Total lignes: ${boxRows.length}`, 14, 26);

    autoTable(doc, {
      startY: 32,
      head: [["Barcode", "Article", "Quantite"]],
      body: boxRows.map((item) => [
        item.barcode,
        item.productName || "Non renseigne",
        String(item.quantity || 0)
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 119, 255] }
    });

    doc.save(`inventaire-box-${currentBox}-${new Date().toISOString().slice(0, 10)}.pdf`);
    keepScannerFocused();
  };

  const clearAll = () => {
    setRows([]);
    setBoxes(["A"]);
    setCurrentBox("A");
    keepScannerFocused();
  };

  const saveInventorySnapshot = async () => {
    if (!rows.length) {
      message.warning("Aucune ligne a sauvegarder.");
      return;
    }

    const snapshot = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      boxes,
      rows
    };

    let existing = [];
    try {
      existing = JSON.parse(localStorage.getItem(ARCHIVE_STORAGE_KEY) || "[]");
      if (!Array.isArray(existing)) {
        existing = [];
      }
    } catch (error) {
      existing = [];
    }

    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify([snapshot, ...existing]));

    let savedToDatabase = false;
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/inventaire/session`,
        {
          sessionLabel: `Inventaire ${new Date().toLocaleString()}`,
          boxes,
          rows
        },
        {
          headers: { "x-api-key": process.env.REACT_APP_API_KEY }
        }
      );
      savedToDatabase = true;
    } catch (error) {
      console.error("Error while saving inventaire in database:", error);
    }

    if (savedToDatabase) {
      message.success("Inventaire sauvegarde (local + base de donnees).");
    } else {
      message.warning("Inventaire sauvegarde localement seulement (DB indisponible).");
    }
    keepScannerFocused();
  };

  const columns = [
    {
      title: "Barcode",
      dataIndex: "barcode",
      key: "barcode",
      width: 220
    },
    {
      title: "Nom Produit",
      dataIndex: "productName",
      key: "productName",
      render: (_, record) => (
        <Input
          value={record.productName}
          onChange={(e) => updateRowName(record.key, e.target.value)}
          disabled={record.foundInDb}
          placeholder="Saisir le nom du produit"
        />
      )
    },
    {
      title: "Quantite",
      dataIndex: "quantity",
      key: "quantity",
      width: 150,
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => {
            const nextValue = Number(value);
            setRows((prev) =>
              prev.map((row) =>
                row.key === record.key
                  ? { ...row, quantity: Number.isFinite(nextValue) && nextValue > 0 ? nextValue : 1 }
                  : row
              )
            );
          }}
          style={{ width: "100%" }}
        />
      )
    },
    {
      title: "BOX",
      dataIndex: "box",
      key: "box",
      width: 120,
      render: (value) => <Tag color="blue">{value}</Tag>
    },
    {
      title: "Action",
      key: "action",
      width: 110,
      render: (_, record) => (
        <Button danger icon={<DeleteOutlined />} onClick={() => removeRow(record.key)}>
          Supprimer
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: 20 }}>
      <style>
        {`
          .inventory-row-highlight td {
            background: #e6f7ff !important;
          }
        `}
      </style>
      <Box className="breadcrumb" style={{ marginBottom: 16 }}>
        <Breadcrumb routeSegments={[{ name: "Inventaire", path: "/inventaire" }, { name: "Gestion" }]} />
      </Box>

      <Card>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={10}>
            <Input
              ref={scanInputRef}
              value={scanValue}
              onChange={(e) => onScanInputChange(e.target.value)}
              onPressEnter={() => submitScanValue(scanValue)}
              placeholder="Scanner un code-barres (validation auto)"
              autoComplete="off"
              size="large"
            />
          </Col>
          <Col xs={24} md={8}>
            <Space.Compact style={{ width: "100%" }}>
              <Select
                value={currentBox}
                options={boxes.map((box) => ({ label: `BOX ${box}`, value: box }))}
                onChange={(value) => {
                  setCurrentBox(value);
                  keepScannerFocused();
                }}
                style={{ width: "100%" }}
                size="large"
              />
              <Button icon={<PlusOutlined />} onClick={addBox} size="large">
                BOX
              </Button>
            </Space.Compact>
          </Col>
          <Col xs={24} md={6}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={clearAll}>Vider</Button>
              <Button onClick={saveInventorySnapshot}>Sauvegarder</Button>
              <Button type="primary" onClick={exportPdf}>
                Export BOX
              </Button>
            </Space>
          </Col>
        </Row>
        <div style={{ marginTop: 10 }}>
          <Text type="secondary">
            Scanner-first: le champ reste focalise automatiquement pour une saisie rapide.
          </Text>
          {!loadingProducts && (
            <div style={{ marginTop: 6 }}>
              <Tag color="processing">Produits indexes: {barcodeMap.size}</Tag>
              <Tag color="default">Lignes BOX {currentBox}: {currentBoxRows.length}</Tag>
            </div>
          )}
        </div>
      </Card>

      <Divider orientation="left">Lignes Scannees</Divider>
      {loadingProducts ? (
        <Alert type="info" showIcon message="Chargement du catalogue produits..." />
      ) : (
        <Table
          rowKey="key"
          columns={columns}
          dataSource={currentBoxRows}
          pagination={false}
          bordered
          rowClassName={(record) => (record.key === lastScannedKey ? "inventory-row-highlight" : "")}
        />
      )}

      <Divider orientation="left">Resume par BOX</Divider>
      <Row gutter={[16, 16]}>
        {boxes.map((box) => {
          const items = summaryByBox[box] || [];
          return (
            <Col xs={24} md={12} lg={8} key={box}>
              <Card title={`BOX ${box}`} size="small">
                {items.length ? (
                  items.map((item) => (
                    <div
                      key={item.key}
                      style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}
                    >
                      <Text ellipsis style={{ maxWidth: "70%" }}>
                        {item.productName || item.barcode}
                      </Text>
                      <Tag>{item.quantity}</Tag>
                    </div>
                  ))
                ) : (
                  <Text type="secondary">Aucun article</Text>
                )}
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default Inventaire;
