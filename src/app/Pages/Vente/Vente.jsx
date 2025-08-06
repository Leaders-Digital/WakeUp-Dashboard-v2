import React, { useEffect, useState } from "react";
import { Form, Input, Button, Col, Row, Select, notification, Table } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import jsPDF from "jspdf";
import BarcodeReader from "./BarcodeReader";

const { Option } = Select;

const Vente = () => {
    const [form] = Form.useForm();
    const [products, setProducts] = useState([]);
    const [productEntries, setProductEntries] = useState([{ produit: null, variant: null, quantite: null }]);
    const [addedProducts, setAddedProducts] = useState([]);
    const [totalPrixVente, setTotalPrixVente] = useState(0);
    const [typeClient, setTypeClient] = useState(null);
    const [clients, setClients] = useState([]);
    const [partenaires, setPartenaires] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [typePrix, setTypePrix] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL_PRODUCTION}api/product/all/dashboard`,
                    {
                        headers: { "x-api-key": process.env.REACT_APP_API_KEY },
                    }
                );
                setProducts(response.data.products);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL_PRODUCTION}api/client`, {
                    headers: { "x-api-key": process.env.REACT_APP_API_KEY },
                });
                setClients(response.data);
            } catch (error) {
                console.error("Error fetching clients:", error);
            }
        };

        const fetchPartenaires = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL_PRODUCTION}api/partenaire/getPartenaires`, {
                    headers: { "x-api-key": process.env.REACT_APP_API_KEY },
                });
                setPartenaires(response.data.data);
            } catch (error) {
                console.error("Error fetching partenaires:", error);
            }
        };

        fetchClients();
        fetchPartenaires();
    }, []);
    useEffect(() => {
        const total = addedProducts.reduce((sum, product) => {
            // Choose price type based on selected typePrix
            const price =

                typePrix === "prixGros" ? product.prixGros : typePrix === "prixVente" ? product.prix : 0;

            return sum + (product.quantite || 0) * price;
        }, 0);



        setTotalPrixVente(total);
    }, [addedProducts, typePrix]); // Add typePrix as a dependency
    const handleProductChange = (index, productId) => {
        const selectedProduct = products.find((product) => product._id === productId);
        const newProductEntries = [...productEntries];
        newProductEntries[index].produit = productId;
        newProductEntries[index].variantOptions = selectedProduct?.variants || [];
        newProductEntries[index].variant = selectedProduct?.variants?.[0]?._id || null;
        newProductEntries[index].prix = selectedProduct?.prix;
        newProductEntries[index].prixGros = selectedProduct?.prixGros || 0;
        setProductEntries(newProductEntries);
    };

    const handleFieldChange = (index, field, value) => {
        const newProductEntries = [...productEntries];
        newProductEntries[index][field] = value;
        setProductEntries(newProductEntries);
    };

    const handleAddProduct = () => {
        const hasInvalidEntries = productEntries.some((entry) => !entry.quantite || entry.quantite <= 0);
        if (hasInvalidEntries) {
            notification.error({
                message: "Erreur",
                description: "Veuillez entrer une quantité valide pour tous les produits.",
            });
            return;
        }

        for (const entry of productEntries) {
            const selectedProduct = products.find((p) => p._id === entry.produit);
            const selectedVariant = selectedProduct?.variants?.find((v) => v._id === entry.variant);

            // Validate quantity against available stock
            if (entry.quantite > (selectedVariant?.quantity || 0)) {
                notification.error({
                    message: "Erreur de Quantité",
                    description: `La quantité pour le produit "${selectedProduct?.nom}" et le variant "${selectedVariant?.reference}" dépasse le stock disponible (${selectedVariant?.quantity}).`,
                });
                return;
            }
        }

        // Add valid products to the addedProducts array
        setAddedProducts([...addedProducts, ...productEntries]);
        setProductEntries([{ produit: null, variant: null, quantite: null }]);
    };


    const handleDeleteProduct = (index) => {
        const updatedProducts = addedProducts.filter((_, i) => i !== index);
        setAddedProducts(updatedProducts);
    };
    const handleSubmit = async () => {
        try {
            // Validate required fields
            if (!typeClient || !selectedClient) {
                notification.error({ message: "Veuillez sélectionner un type de client et un client." });
                return;
            }

            // Prepare data to match backend schema
            const productsData = addedProducts.map((product) => ({
                variantId: product.variant,
                quantite: product.quantite,
            }));

            const data = {

                clientType: typeClient,
                client: typeClient === "individual" ? selectedClient : undefined,
                entreprise: typeClient === "enterprise" ? selectedClient : "",
                products: productsData,
                priceType: typePrix,
                totalPrice: totalPrixVente,
            };

            // Log data for debugging

            // Make API request
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL_PRODUCTION}api/vente`,
                data,
                {
                    headers: { "x-api-key": process.env.REACT_APP_API_KEY },
                }
            );

            // Debugging response
            // Success notification and reset state
            notification.success({ message: "Vente ajoutée avec succès!" });
            setAddedProducts([]);
        } catch (error) {
            // Log error for debugging
            console.error("Error submitting vente:", error.response?.data || error);
            notification.error({ message: "Erreur lors de l'ajout de la vente." });
        }
    };


    const columns = [
        {
            title: "Produit",
            dataIndex: "produit",
            render: (productId) => products.find((product) => product._id === productId)?.nom || "",
        },
        {
            title: "Variant",
            dataIndex: "variant",
            render: (variantId, record) => {
                const product = products.find((product) => product._id === record.produit);
                return product?.variants?.find((variant) => variant._id === variantId)?.reference || "N/A";
            },
        },
        {
            title: "Quantité",
            dataIndex: "quantite",
        },
        {
            title: "Prix Unitaire",
            render: (_, record) =>
                typePrix === "prixVente" ? record.prix : typePrix === "prixGros" ? record.prixGros : "N/A",
        },
        {
            title: "Prix Total",
            dataIndex: "quantite",
            render: (quantite, record) => {
                const unitPrice = typePrix === "prixVente" ? record.prix : typePrix === "prixGros" ? record.prixGros : 0;
                return unitPrice * (quantite || 0);
            },
        },

        {
            title: "Action",
            render: (_, __, index) => (
                <Button icon={<DeleteOutlined />} onClick={() => handleDeleteProduct(index)}>
                    Supprimer
                </Button>
            ),
        },
    ];

    return (
        <div
            style={{
                padding: "20px",
                maxWidth: "1200px",
                margin: "50px auto",
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
        >
            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Créer une Nouvelle Vente</h2>
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    {/* Client Type Selection */}
                    <Col span={8}>
                        <Form.Item label="Type de Client" required>
                            <Select
                                placeholder="Sélectionner le type de client"
                                onChange={(value) => {
                                    setTypeClient(value);
                                    setSelectedClient(null);
                                }}
                                value={typeClient}
                            >
                                <Option value="individual">Personne Physique</Option>
                                <Option value="enterprise">Société</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    {/* Client Selection */}
                    <Col span={8}>
                        {typeClient && (
                            <Form.Item label={typeClient === "individual" ? "Client" : "Société"} required>
                                <Select
                                    placeholder={`Sélectionner ${typeClient === "individual" ? "un client" : "une société"
                                        }`}
                                    onChange={(value) => setSelectedClient(value)}
                                    value={selectedClient}
                                >
                                    {(typeClient === "individual" ? clients : partenaires).map((item) => (
                                        <Option key={item._id} value={item._id}>
                                            {typeClient === "individual"
                                                ? `${item.nomClient} ${item.prenomClient}`
                                                : item.nom}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        )}
                    </Col>

                    {/* Price Type Selection */}
                    <Col span={8}>
                        <Form.Item label="Type de Prix" required>
                            <Select
                                placeholder="Sélectionner le type de prix"
                                onChange={(value) => setTypePrix(value)}
                                value={typePrix}
                            >
                                <Option value="prixGros">Prix Gros</Option>
                                <Option value="prixVente">Prix Vente</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Product Entry Section */}
                <h3>Produits à Ajouter</h3>
                {productEntries.map((entry, index) => (
                    <Row gutter={16} align="middle" key={index} style={{ marginBottom: "16px" }}>
                        {/* Product Selection */}
                        <Col span={8}>
                            <Form.Item label="Produit" required>
                                <Select
                                    showSearch
                                    placeholder="Sélectionner un produit"
                                    onChange={(value) => handleProductChange(index, value)}
                                    value={entry.produit}
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option?.children.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {products.map((product) => (
                                        <Option key={product._id} value={product._id}>
                                            {product.nom}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        {/* Variant Selection */}
                        <Col span={8}>
                            <Form.Item label="Variant" required>
                                <Select
                                    placeholder="Sélectionner un variant"
                                    onChange={(value) => handleFieldChange(index, "variant", value)}
                                    value={entry.variant}
                                    disabled={!entry.variantOptions}
                                >
                                    {entry.variantOptions &&
                                        entry.variantOptions.map((variant) => (
                                            <Option key={variant._id} value={variant._id}>
                                                {variant.reference}
                                            </Option>
                                        ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        {/* Quantity Input */}
                        <Col span={5}>
                            <Form.Item label="Quantité" required>
                                <Input
                                    placeholder="Quantité"
                                    type="number"
                                    onChange={(e) =>
                                        handleFieldChange(index, "quantite", parseInt(e.target.value) || null)
                                    }
                                    value={entry.quantite}
                                />
                            </Form.Item>
                        </Col>

                        {/* Add Product Button */}
                        <Col span={3} style={{ textAlign: "center" }}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddProduct}
                                style={{ marginTop: "5px" }}
                            >
                                Ajouter
                            </Button>
                        </Col>
                    </Row>
                ))}

                {/* Added Products Table */}
                <Table
                    columns={columns}
                    dataSource={addedProducts.map((product, index) => ({ ...product, key: index }))}
                    pagination={false}
                    style={{ marginTop: "20px" }}
                />

                {/* Total Price and Submit Button */}
                <div style={{ textAlign: "right", marginTop: "20px" }}>
                    <div>
                        <b>Total Prix Vente:</b> {totalPrixVente} €
                    </div>
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        style={{
                            marginTop: "10px",
                            backgroundColor: "#1890ff",
                            color: "white",
                            borderColor: "#1890ff",
                        }}
                    >
                        Soumettre
                    </Button>
                    <BarcodeReader />
                </div>
            </Form>
        </div>
    );

};

export default Vente;
