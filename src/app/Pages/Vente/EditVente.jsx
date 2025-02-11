import React, { useEffect, useState } from "react";
import { Form, Input, Button, Col, Row, Select, notification, Table } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import logo from "../../../assets/logo.png";
const { Option } = Select;

const EditVente = () => {
    const { id } = useParams(); // Get the vente ID from the route
    const [form] = Form.useForm();
    const [products, setProducts] = useState([]);
    const [productEntries, setProductEntries] = useState([{ produit: null, variant: null, quantite: null }]);
    const [addedProducts, setAddedProducts] = useState([]);
    const [totalPrixVente, setTotalPrixVente] = useState(0);
    const [numFacture, setNumFacture] = useState("");
    const [typeClient, setTypeClient] = useState(null);
    const [clients, setClients] = useState([]);
    const [partenaires, setPartenaires] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [status, setStatus] = useState(null);
    const [typePrix, setTypePrix] = useState(null);
    const navigate = useNavigate();

    // Fetch products, clients, partenaires, and vente details
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

        const fetchVente = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL_PRODUCTION}api/vente/${id}`, {
                    headers: { "x-api-key": process.env.REACT_APP_API_KEY },
                });
                const vente = response.data.vente;

                setNumFacture(vente.numFacture);
                setTypeClient(vente.clientType);
                setStatus(vente.status);
                setSelectedClient(vente.client || vente.entreprise);
                setTypePrix(vente.priceType);
                setAddedProducts(
                    vente.products.map((p) => ({
                        produit: p.variantId.product._id, // Product ID
                        variant: p.variantId._id, // Variant ID
                        quantite: p.quantite, // Quantity
                        prix: p.variantId.product.prix, // Retail price
                        prixGros: p.variantId.product.prixGros, // Wholesale price
                    }))
                );
            } catch (error) {
                console.error("Error fetching vente:", error);
            }
        };

        fetchProducts();
        fetchClients();
        fetchPartenaires();
        fetchVente();
    }, [id]);

    // Calculate total price
    useEffect(() => {
        const total = addedProducts.reduce((sum, product) => {
            const price = typePrix === "prixGros" ? product.prixGros : product.prix;
            return sum + (price || 0) * (product.quantite || 0);
        }, 0);
        setTotalPrixVente(total);
    }, [addedProducts, typePrix]);

    const handleProductChange = (index, productId) => {
        const selectedProduct = products.find((product) => product._id === productId);
        const newProductEntries = [...productEntries];
        newProductEntries[index].produit = productId;
        newProductEntries[index].variantOptions = selectedProduct?.variants || [];
        newProductEntries[index].variant = selectedProduct?.variants?.[0]?._id || null;
        newProductEntries[index].prix = selectedProduct?.prix || 0;
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

            // Check if the entered quantity exceeds available stock
            if (entry.quantite > selectedVariant?.quantity) {
                notification.error({
                    message: "Erreur de Quantité",
                    description: `La quantité pour le produit "${selectedProduct?.nom}" et le variant "${selectedVariant?.reference}" dépasse le stock disponible (${selectedVariant?.quantity}).`,
                });
                return;
            }
        }

        // Add valid products to addedProducts array
        setAddedProducts([...addedProducts, ...productEntries]);
        setProductEntries([{ produit: null, variant: null, quantite: null }]);
    };


    const handleDeleteRow = (index) => {
        const newProducts = addedProducts.filter((_, i) => i !== index);
        setAddedProducts(newProducts);
    };

    const handleSubmit = async () => {
        try {
            if (!numFacture || !typeClient || !selectedClient) {
                notification.error({ message: "Veuillez remplir tous les champs requis." });
                return;
            }

            const productsData = addedProducts.map((product) => ({
                variantId: product.variant, // Use variant ID
                quantite: product.quantite, // Include quantity
            }));

            const data = {
                numFacture,
                clientType: typeClient,
                client: typeClient === "individual" ? selectedClient : undefined,
                entreprise: typeClient === "enterprise" ? selectedClient : undefined,
                products: productsData,
                priceType: typePrix,
                totalPrice: totalPrixVente,
            };

            await axios.put(`${process.env.REACT_APP_API_URL_PRODUCTION}api/vente/update/${id}`, data, {
                headers: { "x-api-key": process.env.REACT_APP_API_KEY },
            });

            notification.success({ message: "Vente modifiée avec succès!" });
            navigate("/vente/list");
        } catch (error) {
            console.error("Error updating vente:", error);
            notification.error({ message: "Erreur lors de la modification de la vente." });
        }
    };

    const columns = [
        {
            title: "Produit",
            dataIndex: "produit",
            render: (productId) => products.find((product) => product._id === productId)?.nom || "N/A",
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
            title: "Actions",
            render: (_, __, index) => (
                <Button disabled={status === "terminé"} danger icon={<DeleteOutlined />} onClick={() => handleDeleteRow(index)}>
                    Supprimer
                </Button>
            ),
        },
    ];
    const handleGenerateInvoice = () => {
        if (!typeClient || !selectedClient || addedProducts.length === 0) {
            notification.error({ message: "Veuillez compléter tous les champs pour générer une facture." });
            return;
        }

        const doc = new jsPDF();

        doc.addImage(logo, "PNG", 14, 10, 40, 20); // Adjust dimensions as needed

        // Title
        doc.setFontSize(18);
        doc.text("FACTURE", 105, 40, null, null, "center");

        // Invoice Number
        doc.setFontSize(12);
        doc.text(`Numero de Facture: ${numFacture}`, 14, 50);

        // Client Information
        const client = typeClient === "individual"
            ? clients.find((c) => c._id === selectedClient)
            : partenaires.find((p) => p._id === selectedClient);

        doc.text(`Nom: ${client?.nomClient || client?.nom || ""} ${client?.prenomClient || ""}`, 14, 60);
        doc.text(`Adresse: ${client?.adresse || "N/A"}`, 14, 66);
        doc.text(`Ville: ${client?.ville || "N/A"}`, 14, 72);
        doc.text(`Code Postal: ${client?.codePostal || "N/A"}`, 14, 78);
        doc.text(`Téléphone: ${client?.telephone || "N/A"}`, 14, 84);
        doc.text(`Date de Commande: ${new Date().toLocaleString("fr-FR")}`, 14, 90);

        // Table Headers and Body
        doc.autoTable({
            head: [["#", "Produit", "Variant", "Quantité", "Prix Unitaire (TND)", "Prix Total (TND)"]],
            body: addedProducts.map((product, index) => {
                const selectedProduct = products.find((p) => p._id === product.produit);
                const selectedVariant = selectedProduct?.variants.find((v) => v._id === product.variant);

                const unitPrice =
                    typePrix === "prixVente" ? product.prix : typePrix === "prixGros" ? product.prixGros : 0;

                return [
                    index + 1,
                    selectedProduct?.nom || "N/A", // Product name
                    selectedVariant?.reference || "N/A", // Variant reference
                    product.quantite,
                    unitPrice.toFixed(2), // Unit price
                    (unitPrice * product.quantite).toFixed(2), // Total price for the item
                ];
            }),
            startY: 100,
            headStyles: {
                fillColor: "#d47e00", // Header background color
                textColor: "#FFFFFF", // Header text color
                fontStyle: "bold",
            },
            bodyStyles: {
                textColor: "#000000",
            },
            columnStyles: {
                0: { halign: "center" }, // Center align for #
                1: { halign: "left" }, // Left align for Product
                2: { halign: "left" }, // Left align for Variant
                3: { halign: "center" }, // Center align for Quantity
                4: { halign: "right" }, // Right align for Unit Price
                5: { halign: "right" }, // Right align for Total Price
            },
        });


        doc.setFontSize(12);
        const summaryStartY = doc.lastAutoTable.finalY + 10;

        doc.text(`Total: ${totalPrixVente.toFixed(2)} TND`, 190, summaryStartY, null, null, "right");

        // Footer
        doc.setFontSize(10);
        doc.text(
            "Merci pour votre achat!\nPour toute question, veuillez nous contacter au contact@leaders-makeup.com",
            14,
            doc.lastAutoTable.finalY + 40
        );

        // Save PDF
        doc.save(`facture-${numFacture}.pdf`);
    };



    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "50px auto", backgroundColor: "white", borderRadius: "8px" }}>
            <h2 style={{ marginBottom: "20px" }}>Modifier Vente</h2>
            <Form form={form} layout="vertical">
                <Row gutter={16}>

                    <Col span={8}>
                        <Form.Item label="Type de Client" required>
                            <Select
                                disabled={status === "terminé"}
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
                    <Col span={8}>
                        {typeClient && (
                            <Form.Item label={typeClient === "individual" ? "Client" : "Société"} required>
                                <Select
                                    disabled={status === "terminé"}
                                    placeholder={`Sélectionner ${typeClient === "individual" ? "un client" : "une société"}`}
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

                    <Col span={8}>
                        <Form.Item label="Type de Prix" required>
                            <Select
                                disabled={status === "terminé"}
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
                {
                    status !== "terminé" ? <div>
                        <h3>Ajouter un Produit</h3>
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
                                            onChange={(e) =>
                                                handleFieldChange(index, "quantite", parseInt(e.target.value) || null)
                                            }
                                            value={entry.quantite}
                                        />
                                    </Form.Item>
                                </Col>
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
                    </div> : null
                }

            </Form>

            <Table
                columns={columns}
                dataSource={addedProducts.map((product, index) => ({ ...product, key: index }))}
                pagination={false}
                style={{ marginTop: "20px" }}
            />
            <div style={{ textAlign: "right", marginTop: "20px" }}>
                <div style={{ padding: "20px" }}><b>Total Prix Vente:</b> {totalPrixVente} €</div>
                {
                    status === "terminé" ?
                        <Button
                            type="default"
                            onClick={handleGenerateInvoice}
                            style={{
                                marginTop: "10px",
                                marginRight: "10px",
                                backgroundColor: "#52c41a",
                                color: "white",
                                borderColor: "#52c41a",
                            }}
                        >
                            Générer la Facture
                        </Button> :
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

                }

            </div>
        </div>
    );
};

export default EditVente;
