import React from "react";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { Avatar, Card, Modal } from "antd";
import Meta from "antd/es/card/Meta";
import BlogDetails from "./BlogDetails";
import axios from "axios";
const { confirm } = Modal;

const OneBlog = ({ item, getBlog }) => {
  // Function to delete a blog
  const deleteBlog = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL_PRODUCTION}api/blog/delete/${id}`);
      getBlog(); // Refresh the blog list
    } catch (error) {
      console.error("Error deleting the blog:", error);
    }
  };

  // Show the confirmation modal before deleting
  const showDeleteConfirm = (id) => {
    confirm({
      title: "Are you sure you want to delete this blog?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        // If the user confirms, call deleteBlog
        deleteBlog(id);
      },
      onCancel() {
        console.log("Cancel the delete action");
      }
    });
  };

  return (
    <>
      <Card
        style={{
          width: 300
        }}
        cover={
          <img alt="example" src={`${process.env.REACT_APP_API_URL_PRODUCTION}` + item.blogImage} />
        }
        actions={[
          <BlogDetails key="view" item={item} />,
          <EditOutlined key="edit" />,
          <DeleteOutlined key="delete" onClick={() => showDeleteConfirm(item._id)} />
        ]}
      >
        <Meta title={item.title} description={item.description} />
      </Card>
    </>
  );
};

export default OneBlog;
