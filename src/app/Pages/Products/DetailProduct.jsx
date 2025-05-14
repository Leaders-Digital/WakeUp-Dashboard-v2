// src/app/Pages/Products/DetailProduct.jsx

import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import {
  Button,
  Card,
  Col,
  Divider,
  Row,
  Table,
  Tag,
  message,
  Spin,
  Space,
  Popconfirm,
  Modal,
  Form,
  Input,
  Upload
} from "antd";
import { EditOutlined, PlusOutlined, UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { Breadcrumb } from "app/components";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const DetailProduct = () => {
  const location = useLocation();
  const id = location.state?.productId;
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [currentVariant, setCurrentVariant] = useState(null);
  const [variant, setVariant] = useState([]); // Assuming you have this state set up
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false); // Your modal state if needed

  // Ant Design Form instance
  const [form] = Form.useForm();

  // Fetch Product Details
  const getProductDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/product/${id}`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
          }
        }
      );

      setProduct(response.data);
      setVariants(response.data.variants); // Assuming variants are populated
    } catch (error) {
      message.error("Erreur lors de la récupération des détails du produit.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getProductDetails();
    }
  }, [id]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  // Handlers for Add Variant Modal
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  // Handlers for Update Variant Modal
  const showUpdateModal = (variant) => {
    setCurrentVariant(variant);
    form.setFieldsValue({
      reference: variant.reference,
      codeAbarre: variant.codeAbarre,
      color: variant.color,
      quantity: variant.quantity
      // Note: Upload components handle files separately
      // We'll handle pre-loading files differently if needed
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateCancel = () => {
    setIsUpdateModalOpen(false);
    setCurrentVariant(null);
    form.resetFields();
  };

  // Function to handle Add Variant Form Submission
  const handleFinish = async (values) => {
    const { reference, codeAbarre, color, quantity, picture, icon } = values;

    const formData = new FormData();
    formData.append("reference", reference);
    formData.append("codeAbarre", codeAbarre);
    formData.append("color", color);
    formData.append("quantity", quantity);

    // Extract the first file from the fileList
    if (picture && picture.length > 0) {
      formData.append("picture", picture[0].originFileObj);
    }

    if (icon && icon.length > 0) {
      formData.append("icon", icon[0].originFileObj);
    }

    formData.append("productId", id);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/product/add-variant`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-api-key": process.env.REACT_APP_API_KEY
          }
        }
      );
      message.success("Variant ajouté avec succès !");
      setIsModalOpen(false);
      getProductDetails();
      form.resetFields();
    } catch (error) {
      console.error("Erreur:", error);
      message.error("Une erreur est survenue lors de l'ajout du variant.");
    }
  };

  // Function to handle Update Variant Form Submission
  const handleUpdateFinish = async (values) => {
    const { reference, codeAbarre, color, quantity, picture, icon } = values;

    const formData = new FormData();
    formData.append("productId", id);
    formData.append("variantId", currentVariant._id); // Ensure variant ID is sent
    formData.append("reference", reference);
    formData.append("codeAbarre", codeAbarre);
    formData.append("color", color);
    formData.append("quantity", quantity);

    // Append new picture if uploaded; else, it won't be included and backend will use existing
    if (picture && picture.length > 0) {
      formData.append("picture", picture[0].originFileObj);
    }

    // Append new icon if uploaded; else, it won't be included and backend will use existing
    if (icon && icon.length > 0) {
      formData.append("icon", icon[0].originFileObj);
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/product/update/variant`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-api-key": process.env.REACT_APP_API_KEY
          }
        }
      );
      message.success("Variant mis à jour avec succès !");
      getProductDetails(); // Refresh the variants list
      form.resetFields();
      setIsUpdateModalOpen(false);
      setCurrentVariant(null);
    } catch (error) {
      console.error("Erreur:", error);
      message.error("Une erreur est survenue lors de la mise à jour du variant.");
    }
  };

  const handleDeleteVariant = async (variantId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/product/variant/${variantId}`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
          }
        }
      );
      message.success("Variant deleted successfully!");
      setVariant((prevVariants) => prevVariants.filter((v) => v._id !== variantId)); // Update the state
      setIsDeleteModalVisible(false); // Close the confirmation modal if it’s open
      getProductDetails();
    } catch (error) {
      message.error("Error deleting variant.");
      console.error("Error deleting variant:", error);
    }
  };

  // Function to handle form submission failure
  const handleFinishFailed = (errorInfo) => {
    message.error("Veuillez corriger les erreurs du formulaire.");
  };
  const quantity = () => {
    let quantity = 0;
    product.variants.map((variant) => {
      quantity += variant.quantity;
    });
    return quantity;
  };
  // Define Columns for Variants Table
  const columns = [
    {
      title: "Photo",
      dataIndex: "picture",
      key: "picture",
      render: (picture) => (
        <img
          src={`${process.env.REACT_APP_API_URL_PRODUCTION}${picture}`}
          alt="Variant"
          style={{ width: "70px", height: "70px", borderRadius: "8px" }}
        />
      ),
      width: 100,
      align: "center"
    },
    {
      title: "Reference",
      dataIndex: "reference",
      key: "reference"
    },
    {
      title: "Code Abarre",
      dataIndex: "codeAbarre",
      key: "codeAbarre"
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      render: (color) => <Tag color={color}>{color}</Tag>
    },
    {
      title: "Icon",
      dataIndex: "icon",
      key: "icon",
      render: (icon) => (
        <img
          src={`${process.env.REACT_APP_API_URL_PRODUCTION}${icon}`}
          alt="Variant"
          style={{ width: "70px", height: "70px", borderRadius: "8px" }}
        />
      ),
      width: 100,
      align: "center"
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center"
    },
    {
      title: "Action",
      key: "action",
      render: (
        text,
        variant // Change here: text, variant instead of _, variant
      ) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => showUpdateModal(variant)} />
          <Popconfirm
            title="Êtes-vous sûr de supprimer cette variante ?"
            onConfirm={() => handleDeleteVariant(variant._id)} // Use variant instead of record
            okText="Oui"
            cancelText="Non"
          >
            <DeleteOutlined style={{ color: "red", cursor: "pointer" }} />
          </Popconfirm>
        </Space>
      ),
      align: "center",
      width: 100
    }
  ];

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Produit non trouvé.</p>
        <Button type="primary" onClick={() => navigate("/produit/liste")}>
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ paddingBottom: "25px" }}>
        <Box className="breadcrumb">
          <Breadcrumb
            routeSegments={[
              { name: "Liste Produits", path: "/produit/liste" },
              { name: ` ${product?.nom}` }
            ]}
          />
        </Box>
      </div>

      <Row gutter={16}>
        <Col xs={24} xl={24}>
          <Card
            type="inner"
            title={`Détail Produit : ${product.nom}`}
            extra={
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  // Navigate to Edit Product page
                  navigate(`/produit/modifier`, {
                    state: { productId: product._id }
                  });
                }}
              >
                Modifier
              </Button>
            }
          >
            <Row gutter={16}>
              <Col xs={24} xl={6} style={{ padding: "20px" }}>
                <img
                  height="300px"
                  width="300px"
                  src={`${process.env.REACT_APP_API_URL_PRODUCTION}${product.mainPicture}`}
                  alt={product?.nom}
                  style={{ objectFit: "cover", borderRadius: "8px" }}
                />
              </Col>

              <Col xs={24} xl={18} style={{ padding: "20px" }}>
                <h3>{product?.nom}</h3>
                <h4>Prix : {product.prix} TND</h4>
                <p
                  style={{
                    maxWidth: "450px",
                    fontSize: "12px",
                    opacity: "0.5"
                  }}
                >
                  {product.description}
                </p>
                <Tag color={product.solde ? "green" : "red"}>
                  {product.solde ? "Soldé" : "Non Soldé"}
                </Tag>{" "}
                Quantité : {quantity()}
                <h4>Catégorie : {product.categorie}</h4>
                <h4>Sous-Catégorie : {product.subCategorie}</h4>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">Liste Variants</Divider>

      <Row gutter={16} style={{ paddingTop: "20px" }}>
        <Col xs={24} xl={24}>
          <Card
            type="inner"
            title="Liste Variants"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
                Ajouter Variant
              </Button>
            }
          >
            <Table
              dataSource={variants}
              columns={columns}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: "max-content" }}
              bordered
            />
          </Card>
        </Col>
      </Row>

      {/* Modal for Adding Variant */}
      <Modal
        title="Ajouter Variant"
        visible={isModalOpen}
        onCancel={handleCancel}
        footer={null} // We'll use Form's submit button instead
        destroyOnClose
        maskClosable={false} // Prevent closing by clicking on the mask
        keyboard={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          onFinishFailed={handleFinishFailed}
        >
          <Form.Item
            label="Référence"
            name="reference"
            rules={[{ required: true, message: "La référence est obligatoire." }]}
          >
            <Input placeholder="Référence" />
          </Form.Item>

          <Form.Item
            label="Code à barre"
            name="codeAbarre"
            rules={[{ required: true, message: "Le code à barre est obligatoire." }]}
          >
            <Input placeholder="Code à barre" />
          </Form.Item>

          <Form.Item
            label="Couleur"
            name="color"
            rules={[{ required: true, message: "La couleur est obligatoire." }]}
          >
            <Input placeholder="Couleur" />
          </Form.Item>

          <Form.Item
            label="Quantité"
            name="quantity"
            rules={[
              { required: true, message: "La quantité est obligatoire." },

            ]}
          >
            <Input type="number" placeholder="Quantité" />
          </Form.Item>

          {/* Photo Upload */}
          <Form.Item
            label="Photo"
            name="picture"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: "La photo est obligatoire." }]}
          >
            <Upload
              name="picture"
              listType="picture-card"
              beforeUpload={() => false} // Prevent automatic upload
              maxCount={1}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Sélectionner photo</div>
              </div>
            </Upload>
          </Form.Item>

          {/* Icon Upload */}
          <Form.Item
            label="Icône"
            name="icon"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: "L'icône est obligatoire." }]}
          >
            <Upload
              name="icon"
              listType="picture-card"
              beforeUpload={() => false} // Prevent automatic upload
              maxCount={1}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Sélectionner l'icône</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={handleCancel}>Annuler</Button>
              <Button type="primary" htmlType="submit">
                Confirmer
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for Updating Variant */}
      <Modal
        title="Mettre à jour Variant"
        visible={isUpdateModalOpen}
        onCancel={handleUpdateCancel}
        footer={null} // We'll use Form's submit button instead
        destroyOnClose
        maskClosable={false} // Prevent closing by clicking on the mask
        keyboard={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateFinish}
          onFinishFailed={handleFinishFailed}
        >
          <Form.Item
            label="Référence"
            name="reference"
            rules={[{ required: true, message: "La référence est obligatoire." }]}
          >
            <Input placeholder="Référence" />
          </Form.Item>

          <Form.Item
            label="Code à barre"
            name="codeAbarre"
            rules={[{ required: true, message: "Le code à barre est obligatoire." }]}
          >
            <Input placeholder="Code à barre" />
          </Form.Item>

          <Form.Item
            label="Couleur"
            name="color"
            rules={[{ required: true, message: "La couleur est obligatoire." }]}
          >
            <Input placeholder="Couleur" />
          </Form.Item>

          <Form.Item
            label="Quantité"
            name="quantity"
            rules={[
              { required: true, message: "La quantité est obligatoire." },

            ]}
          >
            <Input type="number" placeholder="Quantité" />
          </Form.Item>

          {/* Photo Upload */}
          <Form.Item
            label="Photo"
            name="picture"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={
              [
                // Photo is optional during update; remove required if not needed
              ]
            }
          >
            <Upload
              name="picture"
              listType="picture-card"
              beforeUpload={() => false} // Prevent automatic upload
              maxCount={1}
              defaultFileList={
                currentVariant && currentVariant.picture
                  ? [
                    {
                      uid: "-1",
                      name: "Current Picture",
                      status: "done",
                      url: `${process.env.REACT_APP_API_URL_PRODUCTION}${currentVariant.picture}`
                    }
                  ]
                  : []
              }
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Sélectionner photo</div>
              </div>
            </Upload>
          </Form.Item>

          {/* Icon Upload */}
          <Form.Item
            label="Icône"
            name="icon"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={
              [
                // Icon is optional during update; remove required if not needed
              ]
            }
          >
            <Upload
              name="icon"
              listType="picture-card"
              beforeUpload={() => false} // Prevent automatic upload
              maxCount={1}
              defaultFileList={
                currentVariant && currentVariant.icon
                  ? [
                    {
                      uid: "-1",
                      name: "Current Icon",
                      status: "done",
                      url: `${process.env.REACT_APP_API_URL_PRODUCTION}${currentVariant.icon}`
                    }
                  ]
                  : []
              }
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Sélectionner l'icône</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={handleUpdateCancel}>Annuler</Button>
              <Button type="primary" htmlType="submit">
                Confirmer
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DetailProduct;
