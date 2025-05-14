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
  const [logoFile, setLogoFile] = useState(null);

  const getPartenaire = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/partenaire/getPartenaires`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
          },
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

  const addPartenaire = async (values) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        formData.append(key, values[key]);
      });

      if (logoFile) {
        formData.append("logo", logoFile);
      } else {
        console.error("Logo file is missing!");
      }

      // Log formData contents
      for (let [key, value] of formData.entries()) {
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/partenaire/addPartenaire`,
        formData,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      message.success("Partenaire ajouté avec succès !");
      setIsModalVisible(false);
      form.resetFields();
      setLogoFile(null);
      getPartenaire();
    } catch (error) {
      console.error(error);
      message.error("Échec de l'ajout du partenaire.");
    }
  };



  const updatePartenaire = async (values) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        formData.append(key, values[key]);
      });

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      await axios.put(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/partenaire/updatePartenaire/${editingId}`,
        formData,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      message.success("Partenaire mis à jour avec succès !");
      setIsModalVisible(false);
      form.resetFields();
      setLogoFile(null); // Reset logo file
      setEditingId(null);
      getPartenaire();
    } catch (error) {
      console.error(error);
      message.error("Échec de la mise à jour du partenaire.");
    }
  };


  const handleFormSubmit = (values) => {
    if (editingId) {
      updatePartenaire(values);
    } else {
      addPartenaire(values);
    }
  };

  const showEditModal = (record) => {
    setEditingId(record._id);
    form.setFieldsValue({
      nom: record.nom,
      matriculFiscal: record.matriculFiscal,
      telephone: record.telephone,
      email: record.email,
      ville: record.ville,
      delegation: record.delegation,
      codePostal: record.codePostal,
      adresse: record.adresse,
      lien: record.lien,
      status: record.status,
      location: record.location,
    });
    setIsModalVisible(true);
  };

  const deletePartenaire = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/partenaire/deletePartenaire/${id}`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
          },
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
      },
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
      align: "center",
    },
    {
      title: "Nom partenaire",
      dataIndex: "nom",
      key: "nom",
    },
    {
      title: "Matricul Fiscal",
      dataIndex: "matriculFiscal",
      key: "matriculFiscal",
    },
    {
      title: "Téléphone",
      dataIndex: "telephone",
      key: "telephone",
    },
    {
      title: "Ville",
      dataIndex: "ville",
      key: "ville",
    },
    {
      title: "Delegation",
      dataIndex: "delegation",
      key: "delegation",
    },
    {
      title: "Code Postal",
      dataIndex: "codePostal",
      key: "codePostal",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => new Date(createdAt).toLocaleDateString("fr-FR"),
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
              { name: "Liste des Partenaires", path: "/partenaire" },
              { name: "Partenaire" },
            ]}
          />
        </Box>
      </div>

      <Row gutter={16} style={{ marginBottom: "20px" }}>
        <Col xs={24} xl={8} style={{ marginBottom: "20px" }}>
          <Card title="Nombre de Partenaires">
            <p>{partenaire.length}</p>
          </Card>
        </Col>
        <Col xs={24} xl={8} style={{ marginBottom: "20px" }}>
          <Card title="Partenaires Actifs">
            <p>{partenaire.filter((p) => p.status).length}</p>
          </Card>
        </Col>
        <Col xs={24} xl={8} style={{ marginBottom: "20px" }}>
          <Card title="Partenaires Inactifs">
            <p>{partenaire.filter((p) => !p.status).length}</p>
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">Liste des Partenaires</Divider>

      <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", padding: "10px" }}>
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
          key: record._id,
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
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="nom"
                label="Nom partenaire"
                rules={[{ required: true, message: "Veuillez entrer le nom du partenaire." }]}
              >
                <Input placeholder="Nom du partenaire" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="matriculFiscal"
                label="Matricule Fiscal"
                rules={[{ required: true, message: "Veuillez entrer le matricule fiscal." }]}
              >
                <Input placeholder="Matricule Fiscal" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="telephone"
                label="Téléphone"
                rules={[{ required: true, message: "Veuillez entrer le numéro de téléphone." }]}
              >
                <Input placeholder="Téléphone" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Veuillez entrer l'email." },
                  { type: "email", message: "Veuillez entrer un email valide." },
                ]}
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
                rules={[{ required: true, message: "Veuillez entrer la ville." }]}
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
                rules={[{ required: true, message: "Veuillez entrer l'adresse." }]}
              >
                <Input placeholder="Adresse" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="lien"
                label="Lien"
                rules={[{ required: true, message: "Veuillez entrer le lien." }]}
              >
                <Input placeholder="Lien" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="location"
                label="Localisation"
                rules={[{ required: true, message: "Veuillez entrer la localisation." }]}
              >
                <Input placeholder="Localisation" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="logo" label="Logo" valuePropName="file">
                <Upload
                  listType="picture"
                  beforeUpload={(file) => {
                    setLogoFile(file); // Save the file to state
                    return false; // Prevent automatic upload
                  }}
                  maxCount={1}
                >
                  <Button>Upload</Button>
                </Upload>
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

export default ListePartenaire;
