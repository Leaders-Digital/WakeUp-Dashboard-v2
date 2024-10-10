// src/app/Pages/Products/ProductList.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Modal,
  message,
  Checkbox,
  Spin,
  Input,
  Button,
  Select,
  Row,
  Col,
  Card,
  Divider,
  Space
} from "antd";
import axios from "axios";
import { Breadcrumb } from "app/components";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const { confirm } = Modal;
const { Option } = Select;

// Statistics Card Component
const StatsCard = ({ title, value }) => (
  <Card title={title} bordered={false}>
    <h2 style={{ textAlign: "center" }}>{value}</h2>
  </Card>
);

// Filters Component
const Filters = ({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  categories,
  priceFilter,
  setPriceFilter,
  isSale,
  setIsSale,
  resetFilters,
  onAddProduct // Navigation handler for adding a product
}) => (
  <Row gutter={[16, 16]} style={{ marginTop: "10px" }}>
    <Col xs={24} sm={12} md={6} lg={6}>
      <Input.Search
        placeholder="Chercher un produit"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
      />
    </Col>
    <Col xs={24} sm={12} md={6} lg={6}>
      <Select
        value={categoryFilter}
        onChange={(value) => setCategoryFilter(value)}
        style={{ width: "100%" }}
        placeholder="Filtrer par catégorie"
      >
        <Option value="Tous les catégories">Tous les catégories</Option>
        {categories.map((v) => (
          <Option key={v._id} value={v._id}>
            {v.nom} {/* Assuming 'nom' is the category name */}
          </Option>
        ))}
      </Select>
    </Col>
    <Col xs={24} sm={12} md={6} lg={4}>
      <Select
        value={priceFilter}
        onChange={(value) => setPriceFilter(value)}
        style={{ width: "100%" }}
        placeholder="Trier par prix"
      >
        <Option value="asc">Prix croissant</Option>
        <Option value="desc">Prix décroissant</Option>
      </Select>
    </Col>
    <Col xs={24} sm={12} md={6} lg={2}>
      <Checkbox checked={isSale} onChange={(e) => setIsSale(e.target.checked)}>
        Soldé
      </Checkbox>
    </Col>
    <Col xs={24} sm={12} md={6} lg={4}>
      <Button onClick={resetFilters} block>
        Réinitialiser
      </Button>
    </Col>
    <Col xs={24} sm={12} md={6} lg={2}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={onAddProduct} // Use the passed navigation handler
        block
      >
        Ajouter
      </Button>
    </Col>
  </Row>
);

const ProductList = () => {
  // State Variables
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("Tous les catégories");
  const [search, setSearch] = useState("");
  const [isSale, setIsSale] = useState(false);
  const [priceFilter, setPriceFilter] = useState("asc");
  const [fullResponse, setFullResponse] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate inside the component

  // Fetch Products
  const getProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/product/all/dashboard`,
        {
          params: {
            sortByPrice: priceFilter,
            categorie: categoryFilter,
            solde: isSale,
            search: search
          }
        }
      );
      setProducts(response.data.products);
      setFullResponse(response.data);
    } catch (error) {
      message.error("Erreur lors de la récupération des produits.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Categories
  const getCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/product/get-category`
      );
      setCategories(response.data.categoryCounts);
    } catch (error) {
      message.error("Erreur lors de la récupération des catégories.");
      console.error(error);
    }
  };

  // Effect Hooks
  useEffect(() => {
    getProducts();
  }, [search, categoryFilter, isSale, priceFilter]);

  useEffect(() => {
    getCategories();
  }, []);

  // Calculate Sold Products
  const calculateSoldProducts = () => {
    return products.filter((product) => product.solde).length;
  };

  // Calculate Categories Count
  const calculateCategories = () => {
    // Exclude "Tous les catégories" if present
    return categories.filter((cat) => cat._id !== "Tous les catégories").length;
  };

  // Delete Product
  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL_PRODUCTION}api/product/${productId}`);
      message.success("Produit supprimé avec succès !");
      getProducts(); // Refresh the product list after deletion
    } catch (error) {
      message.error("Échec de la suppression du produit.");
      console.error(error);
    }
  };

  // Show Delete Confirmation Modal
  const showDeleteConfirm = (product) => {
    confirm({
      title: "Êtes-vous sûr de vouloir supprimer ce produit ?",
      icon: <ExclamationCircleOutlined />,
      content: `Produit : ${product.nom}`,
      okText: "Oui",
      okType: "danger",
      cancelText: "Non",
      onOk() {
        deleteProduct(product._id);
      },
      onCancel() {
        // Optional: Handle cancel action
      }
    });
  };

  // Table Columns Configuration
  const columns = [
    // {
    //   key: "id",
    //   render: (_, __, index) => index + 1,
    //   width: 50,
    //   align: "center"
    // },
    {
      title: "Photo",
      dataIndex: "mainPicture",
      render: (mainPicture) => (
        <img
          src={`${process.env.REACT_APP_API_URL_PRODUCTION}${mainPicture}`}
          alt="mainPicture"
          style={{ width: "70px", height: "70px", borderRadius: "8px" }}
        />
      ),
      width: 100,
      align: "center"
    },
    {
      title: "Nom du produit",
      dataIndex: "nom",
      sorter: (a, b) => a.nom.localeCompare(b.nom),
      ellipsis: true
    },
    {
      title: "Categorie",
      dataIndex: "categorie",
    },
    {
      title: "subCategorie",
      dataIndex: "subCategorie",
    },
    // {
    //   title: "Nombre de variants",
    //   dataIndex: "variants",
    //   render: (variant) => variant.length,
    // },
    {
      title: "Prix",
      dataIndex: "prix",
      sorter: (a, b) => a.prix - b.prix,
      render: (prix) => `${prix} TND`,
      align: "right",
      width: 100
    },
    {
      title: "Nombre de variantes",
      dataIndex: "variants",
      render: (variants) => variants.length,
      align: "center",
      width: 150
    },
    {
      title: "Soldé",
      dataIndex: "solde",
      render: (solde) => <Tag color={solde ? "green" : "red"}>{solde ? "Oui" : "Non"}</Tag>,
      align: "center",
      width: 100
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, product) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/produit/details/`, { state: { productId: product._id } })} // Navigate to DetailProduct with product ID
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(product)}
          />
        </Space>
      ),
      align: "center",
      width: 100
    }
  ];

  // Reset Filters Function
  const resetFilters = () => {
    setCategoryFilter("Tous les catégories");
    setSearch("");
    setIsSale(false);
    setPriceFilter("asc");
  };

  // Navigation Handlers
  const handleAddProduct = () => {
    navigate("/produit/ajouter"); // Adjust the path as per your routing setup
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ paddingBottom: "25px" }}>
        <Box className="breadcrumb">
          <Breadcrumb
            routeSegments={[
              { name: "Liste Produits", path: "/produit/liste" },
              { name: "Produit" }
            ]}
          />
        </Box>
      </div>

      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <StatsCard title="Nombre Total des Produits" value={fullResponse.totalProducts || 0} />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatsCard title="Nombre de Produits Soldés" value={calculateSoldProducts()} />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatsCard title="Nombre de Catégories" value={calculateCategories()} />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="Nombre de Sous-Catégories"
            value={fullResponse.totalSubCategories || 0}
          />
        </Col>
      </Row>

      <Divider orientation="left">Nos Produits</Divider>

      {/* Filters */}
      <Filters
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        priceFilter={priceFilter}
        setPriceFilter={setPriceFilter}
        isSale={isSale}
        setIsSale={setIsSale}
        resetFilters={resetFilters}
        onAddProduct={handleAddProduct} // Pass the navigation handler
      />

      {/* Products Table */}
      <div style={{ marginTop: "20px" }}>
        <Spin spinning={loading}>
          {products.length > 0 ? (
            <Table
              columns={columns}
              dataSource={products}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
              bordered
              scroll={{ x: "max-content" }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <p>Aucun produit trouvé.</p>
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default ProductList;
