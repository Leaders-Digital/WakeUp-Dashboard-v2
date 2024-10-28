import React, { useRef, useState, useEffect } from "react";
import { Button, message, Modal } from "antd";
import TextArea from "antd/es/input/TextArea";
import holder from "../../../assets/holder.webp"; // Make sure this path is correct
import axios from "axios";

const EditBlog = ({ item, getBlog, isModalOpen, onClose }) => {
  const fileInputRef = useRef(null);
  const [logo, setLogo] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    // Reset the form whenever the modal opens
    if (isModalOpen) {
      setTitle(item.title);
      setDescription(item.description);
      setContent(item.content);
      setLogo(null);
    }
  }, [isModalOpen, item]);

  const handleOk = () => {
    editBlog();
  };

  const handleCancel = () => {
    onClose(); // Close modal
    // resetForm(); // Reset form on close
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setLogo(selectedFile);
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // const resetForm = () => {
  //   setTitle(item.title || "");
  //   setDescription(item.description || "");
  //   setContent(item.content || "");
  //   setLogo(null);
  // };

  const editBlog = async () => {
    try {
      if (!title || !description || !content) {
        message.error("Veuillez remplir tous les champs obligatoires.");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("content", content);
      if (logo) {
        formData.append("blogImage", logo);
      }

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/blog/update/article/${item._id}`,
        formData,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY
          }
        }
      );
      message.success("Blog modifié avec succès!");
      getBlog();

      // resetForm();
      onClose();
    } catch (error) {
      console.error("Edit blog error:", error); // Log the error details
      message.error("Échec de la modification du blog.");
    }
  };

  return (
    <Modal title="Modifier un Blog" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
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
          src={
            logo
              ? URL.createObjectURL(logo)
              : item.blogImage
              ? `${process.env.REACT_APP_API_URL_PRODUCTION}${item.blogImage}`
              : holder
          }
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
  );
};

export default EditBlog;
