import React, { useEffect, useState, useMemo } from "react";
import { Card, Col, Row, Table, Select, message, Divider, Tag, Input, Modal, Form } from "antd";
import axios from "axios";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons"; // Updated import
// Removed import from '@mui/icons-material'
import { Box } from "@mui/material";
import { Breadcrumb } from "app/components";

const { Option } = Select;
const { Search } = Input;
const { confirm } = Modal;

const Reclamation = () => {
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterEtat, setFilterEtat] = useState(null);
  const [selectedReclamation, setSelectedReclamation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchReclamations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/reclamation/get`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
          }
        }
      );
      setReclamations(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Échec de la récupération des réclamations:", error);
      message.error("Échec de la récupération des réclamations.");
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchReclamations();
  }, []);

  const handleViewClick = (reclamation) => {
    setSelectedReclamation(reclamation);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedReclamation(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/reclamation/update/${id}`,
        { etat: newStatus },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
          }
        }
      );
      message.success(response.data.message);

      setReclamations((prevReclamations) =>
        prevReclamations.map((rec) => (rec._id === id ? { ...rec, etat: newStatus } : rec))
      );
    } catch (error) {
      console.error("Échec de la mise à jour du statut:", error);
      message.error("Échec de la mise à jour du statut.");
    }
  };

  const handleDeleteClick = (id) => {
    confirm({
      title: "Êtes-vous sûr de vouloir supprimer cette réclamation?",
      content: "Cette action est irréversible.",
      okText: "Oui",
      okType: "danger",
      cancelText: "Non",
      onOk: async () => {
        try {
          await axios.delete(
            `${process.env.REACT_APP_API_URL_PRODUCTION}api/reclamation/delete/${id}`,
            {
              headers: {
                "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
              }
            }
          );
          message.success("Réclamation supprimée avec succès.");

          // Update the state to remove the deleted reclamation
          setReclamations((prevReclamations) => prevReclamations.filter((rec) => rec._id !== id));
        } catch (error) {
          console.error("Erreur lors de la suppression:", error);
          message.error("Échec de la suppression de la réclamation.");
        }
      },
      onCancel() {
        // Optional: Handle cancellation if needed
      }
    });
  };

  const columns = [
    {
      title: "Nom",
      dataIndex: "nom",
      key: "nom"
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email"
    },
    {
      title: "Téléphone",
      dataIndex: "telephone",
      key: "telephone"
    },
    // {
    //   title: 'Message',
    //   dataIndex: 'message',
    //   key: 'message',
    // },
    {
      title: "État",
      dataIndex: "etat",
      key: "etat",
      render: (etat) => {
        let color = "";
        switch (etat) {
          case "En attente":
            color = "gold";
            break;
          case "Résolu":
            color = "green";
            break;
          case "Impossible":
            color = "red";
            break;
          default:
            color = "blue";
        }
        return <Tag color={color}>{etat}</Tag>;
      }
    },
    {
      title: "Changer le Statut",
      dataIndex: "etat",
      key: "statusChange",
      render: (etat, record) => (
        <Select
          defaultValue={etat}
          style={{ width: 160 }}
          onChange={(newStatus) => handleStatusChange(record._id, newStatus)}
        >
          <Option value="En attente">En attente</Option>
          <Option value="Résolu">Résolu</Option>
          <Option value="Impossible">Impossible</Option>
        </Select>
      )
    },
    {
      title: "Voir / Supprimer", // Updated title
      key: "actions",
      render: (text, record) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <EyeOutlined
            onClick={() => handleViewClick(record)}
            style={{ cursor: "pointer", color: "#1890ff" }}
          />
          <DeleteOutlined
            onClick={() => handleDeleteClick(record._id)}
            style={{ cursor: "pointer", color: "red" }}
          />
        </div>
      )
    }
  ];

  const filteredReclamations = useMemo(() => {
    return reclamations.filter((rec) => {
      const matchesSearch =
        rec.nom.toLowerCase().includes(searchText.toLowerCase()) ||
        rec.email.toLowerCase().includes(searchText.toLowerCase());
      const matchesEtat = filterEtat ? rec.etat === filterEtat : true;
      return matchesSearch && matchesEtat;
    });
  }, [reclamations, searchText, filterEtat]);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "10px" }}>
        <Box className="breadcrumb">
          <Breadcrumb
            routeSegments={[
              { name: "Gestion des réclamations", path: "/reclamation" },
              { name: "Les Réclamations" }
            ]}
          />
        </Box>
      </div>
      <Row gutter={16}>
        <Col xs={24} xl={8}>
          <Card title="Nombre des  Tickets">{reclamations.length}</Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="Ticket En attente">
            {reclamations.filter((rec) => rec.etat === "En attente").length}
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="Ticket Résolu">
            {reclamations.filter((rec) => rec.etat === "Résolu").length}
          </Card>
        </Col>
        <Col span={24}>
          <Divider orientation="left">Réclamations</Divider>
        </Col>
        <Col xs={24} xl={24}>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Rechercher par nom"
                allowClear
                size="middle"
                onSearch={(value) => setSearchText(value)}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Filtrer par État"
                allowClear
                style={{ width: "100%" }}
                onChange={(value) => setFilterEtat(value)}
              >
                {/* <Option value="Tout les reclamation">Tous les reclamations</Option> */}
                <Option value="En attente">En attente</Option>
                <Option value="Résolu">Résolu</Option>
                <Option value="Impossible">Impossible</Option>
              </Select>
            </Col>
          </Row>
        </Col>
        <Col xs={24} xl={24}>
          <Table
            columns={columns}
            dataSource={filteredReclamations}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
            loading={loading}
          />
        </Col>
      </Row>

      {/* Modal for Viewing Reclamation Details */}
      <Modal
        title="Détails de la Réclamation"
        visible={modalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        {selectedReclamation && (
          <Form layout="vertical">
            <Form.Item label="Nom">
              <Input value={selectedReclamation.nom} disabled />
            </Form.Item>
            <Form.Item label="Email">
              <Input value={selectedReclamation.email} disabled />
            </Form.Item>
            <Form.Item label="Téléphone">
              <Input value={selectedReclamation.telephone} disabled />
            </Form.Item>
            <Form.Item label="Message">
              <Input.TextArea value={selectedReclamation.message} disabled />
            </Form.Item>
            <Form.Item label="État">
              <Tag
                color={
                  selectedReclamation.etat === "En attente"
                    ? "gold"
                    : selectedReclamation.etat === "Résolu"
                    ? "green"
                    : "red"
                }
              >
                {selectedReclamation.etat}
              </Tag>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default Reclamation;
