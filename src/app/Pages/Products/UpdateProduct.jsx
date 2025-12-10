import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Breadcrumb } from "app/components";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Checkbox,
  Upload,
  message,
  Spin,
  Select
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import TextArea from "antd/es/input/TextArea";

const { Option } = Select;

const UpdateProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const productId = location.state.productId;
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [form] = Form.useForm();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [availableSubCategories, setAvailableSubCategories] = useState([]);

  // Category and Subcategory Options
  const categoryOptions = [
    { value: "FACE", label: "Visage" },
    { value: "EYES", label: "Yeux" },
    { value: "LIPS", label: "Lévres" },
    { value: "Produits de soin", label: "Produits de soin" },
    { value: "Brush", label: "Brushes" },
    { value: "PACK", label: "Pack" }
  ];

  const subCategoryOptions = {
    FACE: [
      { value: "FONDATIONS", label: "Fondations" },
      { value: "BB CREAM", label: "BB cream" },
      { value: "BLUSH", label: "Blush" },
      { value: "HIGHLIGHTER", label: "Highlighter" },
      { value: "BRONZER & POWDER", label: "Bronzer & Powder" },
      { value: "PRIMER", label: "Primer" },
      { value: "FIXER", label: "Fixer" }
    ],
    EYES: [
      { value: "MASCARA", label: "Mascara" },
      { value: "CONCEALER", label: "Concealer" },
      { value: "EYESHADOW", label: "Eyeshadow" },
      { value: "EYELINER", label: "Eyeliner" },
      { value: "EYE PENCILS", label: "Eye pencils" },
      { value: "EYE BROW", label: "Eye Brow" }
    ],
    LIPS: [
      { value: "LIPSTICK", label: "LipStick" },
      { value: "LIPGLOSS", label: "LipGloss" },
      { value: "LIPLINER", label: "LipLiner" },
      { value: "BAUMES", label: "Baumes" }
    ],
    "Produits de soin": [
      { value: "Nettoyants", label: "Nettoyants" },
      { value: "SOIN DE VISAGE", label: "Soin de visage" },
      { value: "SOIN DE CORPS", label: "Soin de corps" },
      { value: "SOIN DE CHEVEUX", label: "Soin de cheveux" }
    ],
    Brush: [
      { value: "PINCEAUX DE VISAGE", label: "Pinceaux de Visage" },
      { value: "PINCEAUX DES YEUX", label: "Pinceaux des yeux" },
      { value: "PINCEAUX DES LÈVRES", label: "Pinceaux des lèvres" },
      { value: "BRUSH CLEANSER", label: "Brush Cleaner" }
    ],
    PACK: [
      { value: "PACK BASIC", label: "Pack Basic" },
      { value: "PACK PREMIUM", label: "Pack Premium" }
      // Add more PACK subcategories as needed
    ]
  };

  // Function to fetch product details
  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/product/${productId}`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
          }
        }
      );

      setProduct(response.data);
      // Populate the form with fetched data
      form.setFieldsValue({
        nom: response.data.nom,
        description: response.data.description,
        prix: response.data.prix,
        categorie: response.data.categorie,
        subCategorie: response.data.subCategorie,
        solde: response.data.solde,
        soldePourcentage: response.data.soldePourcentage,
        metaFields: response.data.metaFields,
        prixAchat: response.data.prixAchat,
        prixGros: response.data.prixGros,
        mainPicture: response.data.mainPicture
          ? [
            {
              uid: "-1",
              name: "Current Image",
              status: "done",
              url: `${process.env.REACT_APP_API_URL_PRODUCTION}${response.data.mainPicture}`
            }
          ]
          : []
      });

      // Set selected category and available subcategories
      setSelectedCategory(response.data.categorie);
      setAvailableSubCategories(subCategoryOptions[response.data.categorie] || []);
    } catch (error) {
      message.error("Erreur lors de la récupération des détails du produit.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch product details on component mount
  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
    // eslint-disable-next-line
  }, [productId]);

  // Handle category change
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    // Update available subcategories based on selected category
    setAvailableSubCategories(subCategoryOptions[value] || []);
    // Reset subCategorie field when category changes
    form.setFieldsValue({ subCategorie: undefined });
  };

  // Function to handle form submission
  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("nom", values.nom);
    formData.append("description", values.description);
    formData.append("prix", values.prix);
    formData.append("categorie", values.categorie);
    formData.append("subCategorie", values.subCategorie);
    formData.append("solde", values.solde);
    formData.append("soldePourcentage", values.soldePourcentage);
    formData.append("metaFields", values.metaFields);
    formData.append("prixAchat", values.prixAchat);
    formData.append("prixGros", values.prixGros);


    // Handle image upload
    if (values.mainPicture && values.mainPicture.length > 0) {
      const file = values.mainPicture[0].originFileObj;
      if (file) {
        formData.append("mainPicture", file);
      }
    }

    setLoading(true);
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/product/${productId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-api-key": process.env.REACT_APP_API_KEY
          }
        }
      );
      message.success("Produit mis à jour avec succès!");
      navigate("/produit/liste");
    } catch (error) {
      message.error("Erreur lors de la mise à jour du produit.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Function to normalize file input for Upload component
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ paddingBottom: "25px" }}>
        <Breadcrumb
          routeSegments={[
            { name: "Liste Produits", path: "/produit/liste" },
            { name: "Modifier Produit" }
          ]}
        />
      </div>

      <Card title={product ? `Modifier Produit : ${product.nom}` : "Modifier Produit"}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            solde: false
          }}
        >
          <Form.Item
            label="Nom"
            name="nom"
            rules={[{ required: true, message: "Le nom est requis!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "La description est requise!" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            label="Prix d'achat (EURO)"
            name="prixAchat"
            rules={[{ required: true, message: "Le prix est requis!" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Prix (TND)"
            name="prix"
            rules={[{ required: true, message: "Le prix est requis!" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Prix Gros (TND)"
            name="prixGros"
            rules={[{ required: true, message: "Le prix est requis!" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          {/* Category Select */}
          <Form.Item
            label="Catégorie"
            name="categorie"
            rules={[{ required: true, message: "La catégorie est requise!" }]}
          >
            <Select
              placeholder="Sélectionnez une catégorie"
              onChange={handleCategoryChange}
              allowClear
            >
              {categoryOptions.map((category) => (
                <Option key={category.value} value={category.value}>
                  {category.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Subcategory Select */}
          <Form.Item
            label="Sous-Catégorie"
            name="subCategorie"
            rules={[{ required: true, message: "La sous-catégorie est requise!" }]}
          >
            <Select
              placeholder="Sélectionnez une sous-catégorie"
              disabled={!selectedCategory}
              allowClear
            >
              {availableSubCategories.map((subCategory) => (
                <Option key={subCategory.value} value={subCategory.value}>
                  {subCategory.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="solde" valuePropName="checked" wrapperCol={{ offset: 0 }}>
            <Checkbox>Solde</Checkbox>
          </Form.Item>

          {/* Refactored Conditional Form Item */}
          <Form.Item
            shouldUpdate={(prevValues, currentValues) => prevValues.solde !== currentValues.solde}
          >
            {() => (
              <Form.Item
                label="Pourcentage de Solde (%)"
                name="soldePourcentage"
                rules={[
                  {
                    required: form.getFieldValue("solde"),
                    message: "Le pourcentage de solde est requis!"
                  }
                ]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                  disabled={!form.getFieldValue("solde")} // Disable when 'solde' is unchecked
                />
              </Form.Item>
            )}
          </Form.Item>

          <Form.Item
            label="Image Principale"
            name="mainPicture"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            extra="Formats acceptés: .png, .jpeg, .jpg"
          >
            <Upload
              name="mainPicture"
              listType="picture"
              beforeUpload={() => false} // Prevent automatic upload
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Cliquez pour télécharger</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Tag"
            name="metaFields"
            rules={[{ required: false }]}
          >
            <TextArea />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Mettre à jour le produit
            </Button>
            <Button style={{ marginLeft: "10px" }} onClick={() => navigate("/produit/liste")}>
              Annuler
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UpdateProduct;
