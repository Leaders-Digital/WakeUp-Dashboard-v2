import { Table, Modal, message, Button, Form, Input, Row, Col, Card, Divider } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Breadcrumb } from "app/components";
import { Box } from "@mui/material";

const ListeClients = () => {
  const [clients, setClients] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  const getClients = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/client`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
          },
        }
      );
      setClients(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getClients();
  }, []);

  const addClient = async (values) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/client`,
        values,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
          },
        }
      );
      message.success("Client ajouté avec succès !");
      setIsModalVisible(false);
      form.resetFields();
      getClients();
    } catch (error) {
      console.error(error);
      message.error("Échec de l'ajout du client.");
    }
  };

  const updateClient = async (values) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/client/${editingId}`,
        values,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
          },
        }
      );
      message.success("Client mis à jour avec succès !");
      setIsModalVisible(false);
      form.resetFields();
      setEditingId(null);
      getClients();
    } catch (error) {
      console.error(error);
      message.error("Échec de la mise à jour du client.");
    }
  };

  const handleFormSubmit = (values) => {
    if (editingId) {
      updateClient(values);
    } else {
      addClient(values);
    }
  };

  const showEditModal = (record) => {
    setEditingId(record._id);
    form.setFieldsValue({
      nomClient: record.nomClient,
      prenomClient: record.prenomClient,
      tel: record.tel,
      email: record.email,
      ville: record.ville,
      delegation: record.delegation,
      codePostal: record.codePostal,
      adresse: record.adresse,
    });
    setIsModalVisible(true);
  };

  const deleteClient = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/client/${id}`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
          },
        }
      );
      message.success("Client supprimé avec succès !");
      getClients();
    } catch (error) {
      console.log(error);
      message.error("Échec de la suppression du client.");
    }
  };

  const showDeleteConfirm = (id) => {
    Modal.confirm({
      title: "Êtes-vous sûr de vouloir supprimer ce client ?",
      content: "Cette action est irréversible.",
      okText: "Oui",
      okType: "danger",
      cancelText: "Non",
      onOk() {
        deleteClient(id);
      },
    });
  };

  const columns = [
    {
      title: "Nom",
      dataIndex: "nomClient",
      key: "nomClient",
    },
    {
      title: "Prénom",
      dataIndex: "prenomClient",
      key: "prenomClient",
    },
    {
      title: "Téléphone",
      dataIndex: "tel",
      key: "tel",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Ville",
      dataIndex: "ville",
      key: "ville",
    },
    {
      title: "Délégation",
      dataIndex: "delegation",
      key: "delegation",
    },
    {
      title: "Code Postal",
      dataIndex: "codePostal",
      key: "codePostal",
    },
    {
      title: "Adresse",
      dataIndex: "adresse",
      key: "adresse",
    },
    {
      title: "Action",
      dataIndex: "_id",
      key: "_id",
      render: (id, record) => (
        <>
          <EditOutlined
            onClick={() => showEditModal(record)}
            style={{ color: "blue", cursor: "pointer", fontSize: "16px", marginRight: "10px" }}
          />
          <DeleteOutlined
            onClick={() => showDeleteConfirm(id)}
            style={{ color: "red", cursor: "pointer", fontSize: "16px" }}
          />
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "10px" }}>
        <Box className="breadcrumb">
          <Breadcrumb
            routeSegments={[
              { name: "Liste des Clients", path: "/client" },
              { name: "Client" },
            ]}
          />
        </Box>
      </div>

      <Row gutter={16} style={{ marginBottom: "20px" }}>
        <Col xs={24} xl={8} style={{ marginBottom: "20px" }}>
          <Card title="Nombre de Clients">
            <p>{clients.length}</p>
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">Liste des Clients</Divider>

      <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", padding: "10px" }}>
        <Button
          type="primary"
          onClick={() => {
            setEditingId(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          + Ajouter Client
        </Button>
      </div>

      <Table
        dataSource={clients.map((record) => ({
          ...record,
          key: record._id,
        }))}
        columns={columns}
        scroll={{ x: "max-content" }}
      />

      <Modal
        title={editingId ? "Mettre à jour le Client" : "Ajouter un Client"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="nomClient"
                label="Nom"
                rules={[{ required: true, message: "Veuillez entrer le nom." }]}
              >
                <Input placeholder="Nom" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="prenomClient"
                label="Prénom"
                rules={[{ required: true, message: "Veuillez entrer le prénom." }]}
              >
                <Input placeholder="Prénom" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="tel"
                label="Téléphone"
              >
                <Input placeholder="Téléphone" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: "email", message: "Veuillez entrer un email valide." }]}
              >
                <Input placeholder="Email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="ville"
                label="Ville"
              >
                <Input placeholder="Ville" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="delegation" label="Délégation">
                <Input placeholder="Délégation" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="codePostal" label="Code Postal">
                <Input placeholder="Code Postal" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="adresse"
                label="Adresse"
              >
                <Input placeholder="Adresse" />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col xs={24}>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  {editingId ? "Mettre à jour" : "Ajouter"}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default ListeClients;
