import React, { useState } from "react";
import { Form, Input, InputNumber, Select, Checkbox, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

const { TextArea } = Input;
const { Option } = Select;

const categoryOptions = [
  { value: "FACE", label: "Visage" },
  { value: "EYES", label: "Yeux" },
  { value: "LIPS", label: "Lévres" },
  { value: "Produits de soin", label: "Produits de soin" },
  { value: "Brush", label: "Brushes" },
  { value: "PACK", label: "Pack" }, // Added PACK category for condition
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

const AddProduct = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState("");

  // Handle category change to update subcategories
  const handleCategoryChange = (value) => {
    form.setFieldsValue({ subCategorie: undefined });
    if (subCategoryOptions[value]) {
      setSubCategories(subCategoryOptions[value]);
    } else {
      setSubCategories([]);
    }
  };

  // Handle image upload
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
    }
    return isImage && isLt2M;
  };

  const onFinish = async (values) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("nom", values.nom);
    formData.append("description", values.description);
    formData.append("prix", values.prix.toString());
    formData.append("categorie", values.categorie);
    formData.append("subCategorie", values.subCategorie);
    formData.append("solde", values.solde);
    formData.append(
      "soldePourcentage",
      values.solde ? values.soldePourcentage.toString() : "0"
    );

    // Append image if uploaded
    if (values.mainPicture && values.mainPicture.file) {
      formData.append("mainPicture", values.mainPicture.file.originFileObj);
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_PRODUCTION}/api/product/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        message.success("Product created successfully!");
        form.resetFields(); // Clear the form
      } else {
        message.error("Error creating product.");
      }
    } catch (error) {
      message.error("Network error while creating product.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Add New Product</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          nom: "",
          description: "",
          prix: 0,
          categorie: undefined,
          subCategorie: undefined,
          solde: false,
          soldePourcentage: 0,
        }}
      >
        <Form.Item
          label="Product Name"
          name="nom"
          rules={[{ required: true, message: "Please enter the product name." }]}
        >
          <Input placeholder="Product Name" />
        </Form.Item>

        <Form.Item
          label="Product Description"
          name="description"
          rules={[{ required: true, message: "Please enter the product description." }]}
        >
          <TextArea rows={4} placeholder="Product Description" />
        </Form.Item>

        <Form.Item
          label="Product Price (€)"
          name="prix"
          rules={[{ required: true, message: "Please enter the product price." }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} placeholder="Product Price" />
        </Form.Item>

        <Form.Item
          label="Category"
          name="categorie"
          rules={[{ required: true, message: "Please select a category." }]}
        >
          <Select placeholder="Select a category" onChange={handleCategoryChange} allowClear>
            {categoryOptions.map((cat) => (
              <Option key={cat.value} value={cat.value}>
                {cat.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Sub-Category"
          name="subCategorie"
          rules={[{ required: true, message: "Please select a sub-category." }]}
        >
          <Select placeholder="Select a sub-category" allowClear>
            {subCategories.map((subCat) => (
              <Option key={subCat.value} value={subCat.value}>
                {subCat.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="On Sale" name="solde" valuePropName="checked">
          <Checkbox>On Sale</Checkbox>
        </Form.Item>

        {form.getFieldValue("solde") && (
          <Form.Item
            label="Sale Percentage (%)"
            name="soldePourcentage"
            rules={[
              { required: true, message: "Please enter the sale percentage." },
              { type: "number", min: 0, max: 100, message: "Percentage must be between 0 and 100." },
            ]}
          >
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>
        )}

        <Form.Item label="Main Image" name="mainPicture">
          <Upload
            name="mainPicture"
            listType="picture"
            beforeUpload={beforeUpload}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Click to upload</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Add Product
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddProduct;
