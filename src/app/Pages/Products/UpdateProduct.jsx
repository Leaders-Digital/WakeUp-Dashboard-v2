import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Select, Checkbox, Upload, Button, message, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { useLocation } from "react-router-dom";

const { TextArea } = Input;
const { Option } = Select;

// Define your category and subcategory options here or fetch them from an API
const categoryOptions = [
  { value: "FACE", label: "Visage" },
  { value: "EYES", label: "Yeux" },
  { value: "LIPS", label: "Lévres" },
  { value: "Produits de soin", label: "Produits de soin" },
  { value: "Brush", label: "Brushes" }
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
  ]
};

const UpdateProduct = ({ setView, getProducts }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const location = useLocation();
  console.log(location);

  let productId = location.state;

  // Fetch product details
  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/product/${productId}`
      );
      const productData = response.data;

      setInitialData(productData);
      setImageUrl(
        productData.mainPicture
          ? `${process.env.REACT_APP_API_URL_PRODUCTION}${productData.mainPicture}`
          : ""
      );

      // Set subcategories based on the category
      if (productData.categorie && subCategoryOptions[productData.categorie]) {
        setSubCategories(subCategoryOptions[productData.categorie]);
      }

      // Set form fields
      form.setFieldsValue({
        nom: productData.nom,
        description: productData.description,
        prix: productData.prix,
        categorie: productData.categorie,
        subCategorie: productData.subCategorie,
        solde: productData.solde,
        soldePourcentage: productData.soldePourcentage
      });
    } catch (error) {
      message.error("Erreur lors de la récupération des détails du produit.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Handle category change to update subcategories
  const handleCategoryChange = (value) => {
    form.setFieldsValue({ subCategorie: undefined });
    if (subCategoryOptions[value]) {
      setSubCategories(subCategoryOptions[value]);
    } else {
      setSubCategories([]);
    }
  };

  // Handle image upload before upload (prevent automatic upload)
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Vous ne pouvez télécharger que des fichiers image !");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("L'image doit être plus petite que 2MB !");
    }
    return isImage && isLt2M;
  };

  // Handle form submission
  const onFinish = async (values) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("nom", values.nom);
    formData.append("description", values.description);
    formData.append("prix", values.prix.toString());
    formData.append("categorie", values.categorie);
    formData.append("subCategorie", values.subCategorie);
    formData.append("solde", values.solde);
    formData.append("soldePourcentage", values.solde ? values.soldePourcentage.toString() : "0");

    // Append new image if uploaded
    if (values.mainPicture && values.mainPicture.file) {
      formData.append("mainPicture", values.mainPicture.file.originFileObj);
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/product/${productId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.status === 200) {
        message.success("Produit mis à jour avec succès !");
        getProducts(); // Refresh the product list
        setView("list"); // Navigate back to the list view
      } else {
        message.error("Erreur lors de la mise à jour du produit.");
      }
    } catch (error) {
      message.error("Erreur réseau lors de la mise à jour du produit.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h2>Modifier le Produit</h2>
        {initialData && (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              nom: initialData.nom,
              description: initialData.description,
              prix: initialData.prix,
              categorie: initialData.categorie,
              subCategorie: initialData.subCategorie,
              solde: initialData.solde,
              soldePourcentage: initialData.soldePourcentage
            }}
          >
            <Form.Item
              label="Nom du produit"
              name="nom"
              rules={[{ required: true, message: "Veuillez entrer le nom du produit." }]}
            >
              <Input placeholder="Nom du produit" />
            </Form.Item>

            <Form.Item
              label="Description du produit"
              name="description"
              rules={[{ required: true, message: "Veuillez entrer la description du produit." }]}
            >
              <TextArea rows={4} placeholder="Description du produit" />
            </Form.Item>

            <Form.Item
              label="Prix du produit (€)"
              name="prix"
              rules={[{ required: true, message: "Veuillez entrer le prix du produit." }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} placeholder="Prix du produit" />
            </Form.Item>

            <Form.Item
              label="Catégorie principale"
              name="categorie"
              rules={[{ required: true, message: "Veuillez sélectionner une catégorie." }]}
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
              label="Sous-catégorie"
              name="subCategorie"
              rules={[{ required: true, message: "Veuillez sélectionner une sous-catégorie." }]}
            >
              <Select placeholder="Sélectionnez une sous-catégorie" allowClear>
                {subCategories.map((subCat) => (
                  <Option key={subCat.value} value={subCat.value}>
                    {subCat.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Soldé" name="solde" valuePropName="checked">
              <Checkbox>Soldé</Checkbox>
            </Form.Item>

            {form.getFieldValue("solde") && (
              <Form.Item
                label="Pourcentage du solde (%)"
                name="soldePourcentage"
                rules={[
                  { required: true, message: "Veuillez entrer le pourcentage du solde." },
                  {
                    type: "number",
                    min: 0,
                    max: 100,
                    message: "Le pourcentage doit être entre 0 et 100."
                  }
                ]}
              >
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>
            )}

            <Form.Item label="Image principale" name="mainPicture" valuePropName="file">
              <Upload
                name="mainPicture"
                listType="picture"
                beforeUpload={beforeUpload}
                showUploadList={false}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Cliquez pour télécharger</Button>
              </Upload>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Main"
                  style={{ width: "200px", marginTop: "10px", borderRadius: "8px" }}
                />
              )}
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: "10px" }}>
                Confirmer
              </Button>
              <Button onClick={() => setView("list")}>Annuler</Button>
            </Form.Item>
          </Form>
        )}
      </div>
    </Spin>
  );
};

export default UpdateProduct;
