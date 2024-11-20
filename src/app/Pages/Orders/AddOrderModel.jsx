import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Col, Row, Divider, Select, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const AddOrderModel = ({ visible, onClose, onCreateOrder }) => {
    const [form] = Form.useForm();
    const [products, setProducts] = useState([]);
    const [productEntries, setProductEntries] = useState([{ produit: null, variant: null, quantite: null }]);
    const [prixTotal, setPrixTotal] = useState(0);

    const countries = ["Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba", "Kairouan", "Kasserine", "Kébili", "Kef", "Mahdia", "Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL_PRODUCTION}api/product/all/dashboard`, {
                    headers: { "x-api-key": process.env.REACT_APP_API_KEY }
                });
                setProducts(response.data.products);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    const handleProductChange = (index, productId) => {
        const selectedProduct = products.find(product => product._id === productId);
        const newProductEntries = [...productEntries];
        newProductEntries[index].produit = productId;
        newProductEntries[index].variantOptions = selectedProduct ? selectedProduct.variants : [];
        newProductEntries[index].variant = null; // Reset variant
        setProductEntries(newProductEntries);
    };

    const handleAddProductEntry = () => {
        setProductEntries([...productEntries, { produit: null, variant: null, quantite: null }]);
    };

    const handleFieldChange = (index, field, value) => {
        const newProductEntries = [...productEntries];
        newProductEntries[index][field] = value;
        setProductEntries(newProductEntries);
    };

    const calculateTotalPrice = () => {
        // Example logic: Calculate based on product prices (to be fetched from the product data).
        const total = productEntries.reduce((sum, entry) => {
            const product = products.find(p => p._id === entry.produit);
            const variant = product?.variants.find(v => v.reference === entry.variant);
            return sum + (variant?.price || 0) * (entry.quantite || 0);
        }, 0);
        setPrixTotal(total);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            calculateTotalPrice();

            const payload = {
                ...values,
                listeDesProduits: productEntries,
                listeDesPack: [], // Include packs if applicable
                prixTotal,
            };

            await axios.post(`${process.env.REACT_APP_API_URL_PRODUCTION}api/order/create`, payload, {
                headers: { "x-api-key": process.env.REACT_APP_API_KEY }
            });

            notification.success({ message: "Commande ajoutée avec succès !" });
            form.resetFields();
            setProductEntries([{ produit: null, variant: null, quantite: null }]);
            onClose();
        } catch (error) {
            console.error("Error submitting order:", error);
            notification.error({ message: "Erreur lors de l'ajout de la commande. Veuillez réessayer." });
        }
    };

    return (
        <Modal visible={visible} onCancel={onClose} onOk={handleSubmit} title="Ajouter Commande">
            <Form form={form} layout="vertical" name="add_order_form">
                <Divider orientation="left">Information du client</Divider>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="nom" label="Nom" rules={[{ required: true, message: 'Veuillez entrer le nom' }]}>
                            <Input placeholder="Nom" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="prenom" label="Prénom" rules={[{ required: true, message: 'Veuillez entrer le prénom' }]}>
                            <Input placeholder="Prénom" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Entrez un email valide' }]}>
                            <Input placeholder="Email" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="numTelephone" label="Numéro de Téléphone" rules={[{ required: true, message: 'Veuillez entrer le numéro de téléphone' }]}>
                            <Input placeholder="Numéro de Téléphone" />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left">Informations de livraison</Divider>
                {/* Delivery Information Fields */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="gouvernorat" label="Gouvernorat" rules={[{ required: true, message: 'Veuillez sélectionner le gouvernorat' }]}>
                            <Select placeholder="Sélectionner le gouvernorat">
                                {countries.map((country) => (
                                    <Option key={country} value={country}>{country}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="ville" label="Ville" rules={[{ required: true, message: 'Veuillez entrer la ville' }]}>
                            <Input placeholder="Ville" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="codePostal" label="Code Postal" rules={[{ required: true, message: 'Veuillez entrer le code postal' }]}>
                            <Input placeholder="Code Postal" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="adresse" label="Adresse" rules={[{ required: true, message: "Veuillez entrer l'adresse" }]}>
                            <Input placeholder="Adresse" />
                        </Form.Item>
                    </Col>
                </Row>
                {/* Product and Variant Fields */}
                <Divider orientation="left">Produits</Divider>
                {productEntries.map((entry, index) => (
                    <Row gutter={16} key={index}>
                        <Col span={10}>
                            <Form.Item label={`Produit ${index + 1}`} required>
                                <Select
                                    placeholder="Sélectionner un produit"
                                    onChange={(value) => handleProductChange(index, value)}
                                    value={entry.produit}
                                >
                                    {products.map(product => <Option key={product._id} value={product._id}>{product.nom}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={10}>
                            <Form.Item label="Variant" required>
                                <Select
                                    placeholder="Sélectionner un variant"
                                    onChange={(value) => handleFieldChange(index, 'variant', value)}
                                    value={entry.variant}
                                    disabled={!entry.variantOptions}
                                >
                                    {entry.variantOptions && entry.variantOptions.map(variant => (
                                        <Option key={variant._id} value={variant.reference}>{variant.reference}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item label="Quantité" required>
                                <Input
                                    placeholder="Quantité"
                                    onChange={(e) => handleFieldChange(index, 'quantite', e.target.value)}
                                    value={entry.quantite}
                                />
                            </Form.Item>
                        </Col>
                        
                    </Row>
                ))}
                <Button type="dashed" onClick={handleAddProductEntry} style={{ width: '100%', marginBottom: 16 }}>
                    <PlusOutlined /> Ajouter un produit
                </Button>
            </Form>
        </Modal>
    );
};

export default AddOrderModel;
