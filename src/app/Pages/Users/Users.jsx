import React, { useEffect, useState } from "react";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  message,
  Row,
  Table,
  Modal,
  Input,
  Tag,
  Dropdown,
  Select
} from "antd";
import axios from "axios";
import { Box, Menu } from "@mui/material";
import { Breadcrumb } from "app/components";
import { render } from "react-dom";
import { DownloadOutlined, VerifiedUserOutlined } from "@mui/icons-material";
import { Option } from "antd/es/mentions";
import { set } from "lodash";

const { Search } = Input;

const { confirm } = Modal;

const Users = () => {
  const [internUsers, setInternUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // For the search term

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // For create modal

  // Create form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const showCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateOk = () => {
    createUser();
  };

  const handleCreateCancel = () => {
    setIsCreateModalOpen(false);
  };

  const getUsers = async (search = "") => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/user/getAll`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
          }
        }
      );
      setInternUsers(response.data.data);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL_PRODUCTION}api/user/${id}`, {
        headers: {
          "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
        }
      });
      message.success("User deleted successfully!");
      getUsers(); // Refresh the product list after deletion
    } catch (error) {
      message.error("Failed to delete User");
      console.error(error);
    }
  };

  const createUser = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/user/signup`,
        {
          username,
          password
        },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
          }
        }
      );

      if (response) {
        message.success("User created successfully!");
        getUsers();
        setIsCreateModalOpen(false);
        resetCreateForm();
      }
    } catch (error) {
      message.error(error.response.data.message);
    }
  };

  const changeRole = async (id, role) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/user/changeRole`,
        {
          id,
          newRole: role
        },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
          }
        }
      );
      message.success("role changer avec succès");
    } catch (error) {
      message.error("Failed to delete User");
      console.error(error);
    }
  };
  const changeStatus = async (id, status) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/user/status`,
        {
          id,
          status: status
        },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
          }
        }
      );
      getUsers();
      message.success("status changer avec succès");
    } catch (error) {
      message.error("Failed to delete User");
      console.error(error);
    }
  };
  const resetCreateForm = () => {
    setUsername("");
    setPassword("");
  };

  const showDeleteConfirm = (user) => {
    confirm({
      title: "Are you sure you want to delete this User?",
      icon: <ExclamationCircleOutlined />,
      content: `Utilisateur: ${user.nom}`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        deleteProduct(user._id);
      }
    });
  };

  const columns = [
    {
      key: "id",
      render: (_, __, index) => index + 1
    },
    {
      title: "Nom de l'utilisateur",
      dataIndex: "username",
      key: "username"
    },
    {
      title: "role",
      dataIndex: "role",
      key: "role",
      render: (role, record) => (
        <Select
          defaultValue={role}
          style={{ width: 100 }}
          onChange={(newStatus) => changeRole(record._id, newStatus)}
        >
          <Option value="admin">Admin</Option>
          <Option value="editor">Editor</Option>
          <Option value="viewer">Viewer</Option>
        </Select>
      )
    },

    {
      title: "Dernière connexion",
      dataIndex: "lastLogin",
      key: "isActive",
      render: (lastLogin) =>
        lastLogin
          ? new Date(lastLogin).toLocaleString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })
          : "Jamais connecté"
    },
    {
      title: "status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive, record) =>
        isActive ? (
          <Tag
            style={{ cursor: "pointer" }}
            color="green"
            onClick={() => {
              changeStatus(record._id, false);
            }}
          >
            Activer
          </Tag>
        ) : (
          <Tag
            color="red"
            style={{ cursor: "pointer" }}
            onClick={() => {
              changeStatus(record._id, true);
            }}
          >
            Desactiver
          </Tag>
        )
    },
    {
      title: "Action",
      dataIndex: "id",
      render: (text, user) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => showDeleteConfirm(user)}
        />
      )
    }
  ];

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "10px" }}>
        <Box className="breadcrumb">
          <Breadcrumb
            routeSegments={[
              { name: "Liste des Utilisateurs", path: "/users" },
              { name: "Utilisateur" }
            ]}
          />
        </Box>
      </div>
      <Divider orientation="left" style={{ fontWeight: "700" }}>
        Utilisateurs
      </Divider>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <Search
          placeholder="Search for User"
          style={{
            width: 400
          }}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            getUsers(e.target.value); // Trigger search as user types
          }} // Update search term and trigger search on every input change
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showCreateModal}
          style={{ marginBottom: "20px" }}
        >
          Ajouter un utilisateur
        </Button>
      </div>
      <Table columns={columns} dataSource={internUsers} scroll={{ x: "max-content" }} />

      {/* Create Modal */}
      <Modal
        title="Create User"
        open={isCreateModalOpen}
        onOk={handleCreateOk}
        onCancel={handleCreateCancel}
      >
        {/* Create User form fields */}
        <div
          style={{
            marginBottom: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "5px"
          }}
        >
          <label style={{ fontWeight: "700" }}>nom d'utilisateur :</label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="nom d'utilisateur"
          />
        </div>
        <div
          style={{
            marginBottom: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "5px"
          }}
        >
          <label style={{ fontWeight: "700" }}>Mot de Passe :</label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="mot de passe"
          />
        </div>
        <div
          style={{
            marginBottom: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "5px"
          }}
        ></div>
      </Modal>
    </div>
  );
};

export default Users;
