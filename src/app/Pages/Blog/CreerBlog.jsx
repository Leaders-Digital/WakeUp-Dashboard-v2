import React, { useRef, useState } from "react";
import { Button, message, Modal } from "antd";
import TextArea from "antd/es/input/TextArea";
import holder from "../../../assets/holder.webp";
import axios from "axios";

const CreerBlog = ({ getBlog }) => {
  const fileInputRef = useRef(null);
  const [logo, setLogo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    createBlog();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    resetForm(); // Reset form on cancel as well
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setLogo(selectedFile);
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setContent("");
    setLogo(null);
  };

  const createBlog = async () => {
    try {
      if (!title || !description || !content) {
        message.error("Veuillez remplir tous les champs obligatoires.");
        return;
      }

      // Create FormData object
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("content", content);
      if (logo) {
        formData.append("blogImage", logo); // Append the file object directly
      }

      // Send POST request
      await axios.post(`${process.env.REACT_APP_API_URL_PRODUCTION}api/blog/create`, formData, {
        headers: {
          "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
        }
      });
      message.success("Blog créé avec succès!");
      getBlog(); // Fetch updated list after creation

      // Reset the form and close the modal
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
      message.error("Échec de la création du blog.");
    }
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Ajouter un Blog
      </Button>
      <Modal title="Créer un Blog" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <TextArea
          placeholder="Titre"
          autoSize
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div style={{ margin: "24px 0" }} />
        <TextArea
          placeholder="Description"
          autoSize={{ minRows: 2, maxRows: 6 }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div style={{ margin: "24px 0" }} />
        <TextArea
          placeholder="Contenu"
          autoSize={{ minRows: 3, maxRows: 5 }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            position: "relative",
            marginTop: "20px",
            width: "100%"
          }}
        >
          <img
            src={logo ? URL.createObjectURL(logo) : holder}
            width={150}
            alt="Upload"
            onClick={handleImageClick}
            style={{ cursor: "pointer", marginBottom: "62px", border: "10px" }}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept="image/*"
          />
        </div>
      </Modal>
    </>
  );
};

export default CreerBlog;
