import React, { useEffect, useState } from "react";
import { Form, Input, Button, Col, Row, Select, notification, Table } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";

const { Option } = Select;

const Achat = () => {
    const [form] = Form.useForm();
    const [products, setProducts] = useState([]);
    const [productEntries, setProductEntries] = useState([{ produit: null, variant: null, quantite: null, prixAchat: null }]);
    const [addedProducts, setAddedProducts] = useState([]);
    const [totalPrixAchat, setTotalPrixAchat] = useState(0);
    const [numFacture, setNumFacture] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL_PRODUCTION}api/product/all/dashboard`, {
                    headers: { "x-api-key": process.env.REACT_APP_API_KEY },
                });
                setProducts(response.data.products);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const total = addedProducts.reduce((sum, product) => sum + (product.prixAchat || 0) * (product.quantite || 0), 0);
        setTotalPrixAchat(total);
    }, [addedProducts]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (addedProducts.length > 0 || numFacture) {
                event.preventDefault();
                event.returnValue = ""; // Required for modern browsers
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        // Cleanup the event listener when the component unmounts
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [addedProducts, numFacture]);

    const handleProductChange = (index, productId) => {
        const selectedProduct = products.find((product) => product._id === productId);
        const newProductEntries = [...productEntries];
        newProductEntries[index].produit = productId;
        newProductEntries[index].variantOptions = selectedProduct ? selectedProduct.variants : [];
        newProductEntries[index].prixAchat = selectedProduct ? selectedProduct.prixAchat : null;
        newProductEntries[index].variant = selectedProduct?.variants?.[0]?._id || null;
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

        setAddedProducts([...addedProducts, ...productEntries]);
        setProductEntries(productEntries.map((entry) => ({ ...entry, quantite: null })));
    };

    const handleQuantityChange = (index, newQuantity) => {
        const updatedProducts = [...addedProducts];
        updatedProducts[index].quantite = newQuantity;
        setAddedProducts(updatedProducts);
    };

    const handleDeleteProduct = (index) => {
        const updatedProducts = addedProducts.filter((_, i) => i !== index);
        setAddedProducts(updatedProducts);
    };

    const handleSubmit = async () => {
        try {
            if (!numFacture) {
                notification.error({ message: "Veuillez entrer un numéro de facture." });
                return;
            }

            const productsData = addedProducts.map((product) => ({
                variantId: product.variant,
                quantite: product.quantite,
            }));

            const data = {
                numFacture,
                products: productsData,
                totalPrixAchat,
            };

            const response = await axios.post(`${process.env.REACT_APP_API_URL_PRODUCTION}api/achat/create`, data, {
                headers: { "x-api-key": process.env.REACT_APP_API_KEY },
            });

            notification.success({ message: "Achat ajouté avec succès!" });
            setNumFacture("");
            setAddedProducts([]);
        } catch (error) {
            console.error("Error submitting achat:", error);
            notification.error({ message: "Erreur lors de l'ajout de l'achat." });
        }
    };

    const columns = [
        {
            title: "Produit",
            dataIndex: "produit",
            key: "produit",
            render: (productId) => products.find((product) => product._id === productId)?.nom || "",
        },
        {
            title: "Variant",
            dataIndex: "variant",
            key: "variant",
            render: (variantId, record) => {
                const product = products.find((product) => product._id === record.produit);
                const variant = product?.variants?.find((variant) => variant._id === variantId);
                return variant?.reference || "N/A";
            },
        },
        {
            title: "Quantité",
            dataIndex: "quantite",
            key: "quantite",
            render: (quantite, record, index) => (
                <Input
                    type="number"
                    value={quantite}
                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                />
            ),
        },
        {
            title: "Prix Unitaire",
            dataIndex: "prixAchat",
            key: "prixAchat",
            render: (prixAchat) => (prixAchat ? `${prixAchat}` : "N/A"),
        },
        {
            title: "Prix Total",
            key: "prixTotal",
            render: (text, record) =>
                record.prixAchat && record.quantite
                    ? `${record.prixAchat * record.quantite}`
                    : "N/A",
        },
        {
            title: "Action",
            key: "action",
            render: (text, record, index) => (
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteProduct(index)}
                >
                    Supprimer
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "50px auto", backgroundColor: "white", borderRadius: "8px" }}>
            <h2 style={{ marginBottom: "20px" }}>Créer un Nouveau Achat</h2>
            <Form form={form} layout="vertical" name="add_products_form">
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item label="Numéro de Facture" required>
                            <Input
                                placeholder="Entrer le numéro de facture"
                                value={numFacture}
                                onChange={(e) => setNumFacture(e.target.value)}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <h3>Produits Ajoutés</h3>
                {productEntries.map((entry, index) => (
                    <Row gutter={16} align="middle" key={index} style={{ marginBottom: "16px" }}>
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
                        <Col span={5}>
                            <Form.Item label="Quantité" required>
                                <Input
                                    placeholder="Quantité"
                                    type="number"
                                    onChange={(e) => handleFieldChange(index, "quantite", parseInt(e.target.value) || null)}
                                    value={entry.quantite}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={3} style={{ textAlign: "center" }}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddProduct}
                                style={{ marginTop: "24px" }}
                            >
                                Ajouter
                            </Button>
                        </Col>
                    </Row>
                ))}
            </Form>

            <Table
                columns={columns}
                dataSource={addedProducts.map((product, index) => ({ ...product, key: index }))}
                pagination={false}
                style={{ marginTop: "20px" }}
            />
            <div style={{ textAlign: "right", marginTop: "20px", }}>
                <div><b>Total Prix Achat:</b> {totalPrixAchat} €</div>
                <Button
                    type="primary"
                    onClick={handleSubmit}
                    style={{
                        backgroundColor: "#f9f9f9",
                        color: "#1890ff",
                        border: "1px solid #1890ff",
                    }}
                >
                    Soumettre les Modifications
                </Button>
            </div>

        </div>
    );
};

export default Achat;
