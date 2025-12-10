// src/components/AddProduct.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "app/components"; // Adjust the import path as needed
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

// Category and Subcategory Options
const categoryOptions = [
  { value: "FACE", label: "Visage" },
  { value: "EYES", label: "Yeux" },
  { value: "LIPS", label: "Lévres" },
  { value: "Produits de soin", label: "Produits de soin" },
  { value: "Brush", label: "Brushes" },
  { value: "PACK", label: "Pack" } // Added PACK category for condition
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

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // State to manage subcategories based on selected category
  const [availableSubCategories, setAvailableSubCategories] = useState([]);

  // Function to handle form submission
  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("nom", values.nom);
    formData.append("description", values.description);
    formData.append("prix", values.prix);
    formData.append("categorie", values.categorie);
    formData.append("subCategorie", values.subCategorie);
    formData.append("solde", values.solde);
    formData.append("metaFields", values.metaFields);
    formData.append("prixAchat", values.prixAchat);
    formData.append("prixGros", values.prixGros);


    // Append soldePourcentage only if solde is true
    if (values.solde) {
      formData.append("soldePourcentage", values.soldePourcentage || 0);
    } else {
      formData.append("soldePourcentage", 0); // or omit it if backend can handle missing value
    }

    // Handle image upload
    if (values.mainPicture && values.mainPicture.length > 0) {
      const file = values.mainPicture[0].originFileObj;
      if (file) {
        formData.append("mainPicture", file);
      }
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/product/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-api-key": process.env.REACT_APP_API_KEY
          }
        }
      );
      message.success("Produit créé avec succès!");
      navigate("/produit/liste");
    } catch (error) {
      // Enhanced error handling
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Erreur lors de la création du produit.");
      }
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

  // Handle category change to update subcategories
  const handleCategoryChange = (value) => {
    if (value === "PACK") {
      // If PACK has predefined subcategories, allow user to select
      setAvailableSubCategories(subCategoryOptions[value] || []);
      form.setFieldsValue({ subCategorie: undefined }); // Let user select subcategory
    } else {
      setAvailableSubCategories(subCategoryOptions[value] || []);
      form.setFieldsValue({ subCategorie: undefined });
    }
  };

  // Handle solde checkbox change
  const handleSoldeChange = (e) => {
    if (!e.target.checked) {
      form.setFieldsValue({ soldePourcentage: undefined });
    }
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
            { name: "Ajouter Produit" }
          ]}
        />
      </div>

      <Card title="Ajouter Nouveau Produit">
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
            label="Prix Vente (TND)"
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
              {categoryOptions.map((cat) => (
                <Option key={cat.value} value={cat.value}>
                  {cat.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Sous-Catégorie"
            name="subCategorie"
            rules={[{ required: true, message: "La sous-catégorie est requise!" }]}
          >
            <Select
              placeholder="Sélectionnez une sous-catégorie"
              disabled={!form.getFieldValue("categorie")}
              allowClear
            >
              {availableSubCategories.map((subCat) => (
                <Option key={subCat.value} value={subCat.value}>
                  {subCat.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="solde" valuePropName="checked" wrapperCol={{ offset: 0 }}>
            <Checkbox onChange={handleSoldeChange}>Solde</Checkbox>
          </Form.Item>

          {/* Conditional Form Item for Solde Pourcentage */}
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
              Ajouter le produit
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

export default AddProduct;
