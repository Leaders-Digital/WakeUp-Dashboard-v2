import React, { useState } from "react";
import { Button, Modal } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { getImageUrl } from "app/utils/imageUrl";

const BlogDetails = ({ item }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  //   const handleOk = () => {
  //     setIsModalOpen(false);
  //   };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <EyeOutlined type="primary" onClick={showModal} />
      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Fermer
          </Button>,
        ]}
        bodyStyle={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        style={{
          //   top: 20,
          borderRadius: "8px",
          overflow: "hidden",
        }}
        width={800}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src={getImageUrl(item.blogImage)}
            width={500}
            alt="Blog Image"
            style={{
              borderRadius: "8px",
              objectFit: "cover",
              marginBottom: "20px",
            }}
          />
          <h2 style={{ fontSize: "24px", color: "#333", marginBottom: "10px" }}>
            {item.title}
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "#666",
              lineHeight: "1.6",
              marginBottom: "20px",
              padding: "0 30px",
            }}
          >
            {item.description}
          </p>
          <p
            style={{
              fontSize: "14px",
              color: "#444",
              textAlign: "justify",
              padding: "0 30px",
              lineHeight: "1.8",
            }}
          >
            {item.content}
          </p>
        </div>
      </Modal>
    </>
  );
};

export default BlogDetails;
