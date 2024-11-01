import { Table, Modal, message, Button, Form, Input, Select, Upload, Row, Col, Card, Divider } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Breadcrumb } from "app/components";
import { Box } from "@mui/material";

const { Option } = Select;

const ListePartenaire = () => {
  const [partenaire, setPartenaire] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  const getPartenaire = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/partenaire/getPartenaires`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY
          }
        }
      );
      setPartenaire(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPartenaire();
  }, []);

  const handleAddOrUpdatePartenaire = async (values) => {
    const formData = new FormData();
    formData.append("nom", values.nom);
    formData.append("lien", values.lien);
    formData.append("adresse", values.adresse);
    formData.append("telephone", values.telephone);
    formData.append("status", values.status);
    formData.append("location", values.location);

    if (values.logo) {
      formData.append("logo", values.logo.originFileObj || values.logo);
    }
    
    try {
      if (editingId) {
        await axios.put(
          `${process.env.REACT_APP_API_URL_PRODUCTION}api/partenaire/updatePartenaire/${editingId}`,
          formData,
          {
            headers: {
              "x-api-key": process.env.REACT_APP_API_KEY,
              "Content-Type": "multipart/form-data"
            }
          }
        );
        message.success("Partenaire mis à jour avec succès !");
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL_PRODUCTION}api/partenaire/addPartenaire`,
          formData,
          {
            headers: {
              "x-api-key": process.env.REACT_APP_API_KEY,
              "Content-Type": "multipart/form-data"
            }
          }
        );
        message.success("Partenaire ajouté avec succès !");
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingId(null);
      getPartenaire();
    } catch (error) {
      console.log(error);
      message.error(
        editingId ? "Échec de la mise à jour du partenaire." : "Échec de l'ajout du partenaire."
      );
    }
  };

  const showEditModal = (record) => {
    setEditingId(record._id);
    form.setFieldsValue({
      nom: record.nom,
      lien: record.lien,
      adresse: record.adresse,
      telephone: record.telephone,
      status: record.status,
      logo: record.logo
    });
    setIsModalVisible(true);
  };

  const deletePartenaire = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/partenaire/deletePartenaire/${id}`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY
          }
        }
      );
      message.success("Partenaire supprimé avec succès !");
      getPartenaire();
    } catch (error) {
      console.log(error);
      message.error("Échec de la suppression du partenaire.");
    }
  };

  const showDeleteConfirm = (id) => {
    Modal.confirm({
      title: "Êtes-vous sûr de vouloir supprimer ce partenaire ?",
      content: "Cette action est irréversible.",
      okText: "Oui",
      okType: "danger",
      cancelText: "Non",
      onOk() {
        deletePartenaire(id);
      }
    });
  };

  const columns = [
    {
      title: "Photo",
      dataIndex: "logo",
      render: (logo) => (
        <img
          src={`${process.env.REACT_APP_API_URL_PRODUCTION}${logo}`}
          alt="mainPicture"
          style={{ width: "70px", height: "70px", borderRadius: "8px" }}
        />
      ),
      width: 100,
      align: "center"
    },
    {
      title: "Nom partenaire",
      dataIndex: "nom",
      key: "nom"
    },
    {
      title: "Lien",
      dataIndex: "lien",
      key: "lien"
    },
    {
      title: "Adresse",
      dataIndex: "adresse",
      key: "adresse"
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location"
    },
    {
      title: "Téléphone",
      dataIndex: "telephone",
      key: "telephone"
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (status ? "Actif" : "Inactif")
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
      )
    }
  ];

  // Count active and inactive partners
  const totalPartenaire = partenaire.length;
  const activePartenaire = partenaire.filter((p) => p.status).length;
  const inactivePartenaire = totalPartenaire - activePartenaire;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "10px" }}>
        <Box className="breadcrumb">
          <Breadcrumb
            routeSegments={[{ name: "Liste des Partenaire", path: "/partenaire" }, { name: "Partenaire" }]}
          />
        </Box>
      </div>

      <Row gutter={16} style={{ marginBottom: "20px" }}>
        <Col xs={24} xl={8} style={{ marginBottom: "20px" }}>
          <Card title="Nombre de partenaire">
            <p>{totalPartenaire}</p>
          </Card>
        </Col>
        <Col xs={24} xl={8} style={{ marginBottom: "20px" }}>
          <Card title="Partenaire Actif">
            <p>{activePartenaire}</p>
          </Card>
        </Col>
        <Col xs={24} xl={8} style={{ marginBottom: "20px" }}>
          <Card title="Partenaire Inactif">
            <p>{inactivePartenaire}</p>
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">
        Liste des Partenaire
      </Divider>
      <div style={{ width: "100%", display: "flex", justifyContent: "right", padding: "10px" }}>
        <Button
          type="primary"
          onClick={() => {
            setEditingId(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          + Ajouter Partenaire
        </Button>
      </div>

      <Table
        dataSource={partenaire.map((record) => ({
          ...record,
          rowClassName: record.status ? "active-partner" : "inactive-partner"
        }))}
        columns={columns}
        rowClassName={(record) => (record.status ? "" : "inactive-partner")}
        scroll={{ x: "max-content" }}
      />

      <Modal
        title={editingId ? "Mettre à jour le Partenaire" : "Ajouter un Partenaire"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrUpdatePartenaire}>
          <Form.Item
            name="nom"
            label="Nom partenaire"
            rules={[{ required: true, message: "Veuillez entrer le nom du partenaire." }]}
          >
            <Input placeholder="Nom du partenaire" />
          </Form.Item>

          <Form.Item
            name="lien"
            label="Lien"
            rules={[{ required: true, message: "Veuillez entrer le lien." }]}
          >
            <Input placeholder="Lien" />
          </Form.Item>

          <Form.Item
            name="adresse"
            label="Adresse"
            rules={[{ required: true, message: "Veuillez entrer l'adresse." }]}
          >
            <Input placeholder="Adresse" />
          </Form.Item>

          <Form.Item
            name="telephone"
            label="Téléphone"
            rules={[{ required: true, message: "Veuillez entrer le téléphone." }]}
          >
            <Input placeholder="Téléphone" />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select placeholder="Sélectionner un status">
              <Option value={true}>Actif</Option>
              <Option value={false}>Inactif</Option>
            </Select>
          </Form.Item>

          <Form.Item name="location" label="Location">
            <Input placeholder="Localisation" />
          </Form.Item>

          <Form.Item name="logo" label="Logo" valuePropName="file">
            <Upload
              listType="picture"
              beforeUpload={() => false}
              maxCount={1}
            >
              <Button>Upload</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingId ? "Mettre à jour" : "Ajouter"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ListePartenaire;
