// src/app/Pages/Products/DetailProduct.jsx
import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { Button, Card, Col, Divider, Row, Table, Tag, message, Spin, Space } from "antd";
import { EditOutlined, ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { Breadcrumb } from "app/components";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const DetailProduct = () => {
  const location = useLocation();
  const id = location.state.productId;
  const navigate = useNavigate();
  const [product, setProduct] = useState([]);

  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Product Details
  const getProductDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/product/${id}`
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
      render: (_, variant) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/produit/detail/${id}/variant/edit/${variant._id}`)}
          />
          {/* Add Delete or other actions if necessary */}
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
                  navigate(`/produit/edit/${product._id}`);
                }}
              >
                Modifier
              </Button>
            }
          >
            <Row gutter={16}>
              <Col xs={24} xl={4} style={{ padding: "20px" }}>
                <img
                  height="300px"
                  width="300px"
                  src={`${process.env.REACT_APP_API_URL_PRODUCTION}${product.mainPicture}`}
                  alt={product?.nom}
                  style={{ objectFit: "cover", borderRadius: "8px" }}
                />
              </Col>

              <Col xs={24} xl={20} style={{ padding: "20px" }}>
                <h3>{product?.nom}</h3>
                <h4>Prix : {product.prix} TND</h4>
                <p>{product.description}</p>
                <Tag color={product.solde ? "green" : "red"}>
                  {product.solde ? "Soldé" : "Non Soldé"}
                </Tag>{" "}
                Quantité : {product.quantite}
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
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  // Navigate to Add Variant page
                  navigate(`/produit/detail/${id}/variant/ajouter`);
                }}
              >
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
    </div>
  );
};

export default DetailProduct;
