import React from "react";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Card, Modal } from "antd";
import Meta from "antd/es/card/Meta";
import BlogDetails from "./BlogDetails";
import EditBlog from "./EditBlog"; // Import the EditBlog component
import axios from "axios";
const { confirm } = Modal;

const OneBlog = ({ item, getBlog }) => {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false); // State to control the edit modal

  // Function to delete a blog
  const deleteBlog = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL_PRODUCTION}api/blog/delete/${id}`, {
        headers: {
          "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
        }
      });
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

  // Function to show the edit modal
  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  // Function to close the edit modal
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
  };

  return (
    <>
      <Card
        style={{
          width: 300
        }}
        cover={
          <img
            alt="example"
            src={`${process.env.REACT_APP_API_URL_PRODUCTION}${item.blogImage}`}
            style={{ height: "200px", objectFit: "cover" }}
          />
        }
        actions={[
          <BlogDetails key="view" item={item} />,
          <EditOutlined key="edit" onClick={handleEditClick} />, // Trigger the modal with the icon
          <DeleteOutlined key="delete" onClick={() => showDeleteConfirm(item._id)} />
        ]}
      >
        <Meta title={item.title} description={item.description} />
      </Card>

      {/* Render the EditBlog modal */}
      <EditBlog
        item={item}
        getBlog={getBlog}
        isModalOpen={isEditModalOpen}
        onClose={handleEditModalClose}
      />
    </>
  );
};

export default OneBlog;
