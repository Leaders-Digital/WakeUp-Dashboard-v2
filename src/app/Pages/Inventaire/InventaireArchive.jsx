import React, { useMemo, useState } from "react";
import { Breadcrumb } from "app/components";
import { Box } from "@mui/material";
import { Button, Card, Col, Collapse, Empty, Row, Space, Table, Tag, Typography, message } from "antd";

const { Text } = Typography;
const ARCHIVE_STORAGE_KEY = "wakeup-inventaire-archive-v1";

const InventaireArchive = () => {
  const [version, setVersion] = useState(0);

  const sessions = useMemo(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(ARCHIVE_STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }, [version]);

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
      render: (value, record) => value || <Text type="secondary">{record.barcode}</Text>
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
