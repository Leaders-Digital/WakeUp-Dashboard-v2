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

const { Search } = Input;

const { confirm } = Modal;

const Users = () => {
  const [internUsers, setInternUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // For the search term

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // For create modal

  // Create form states
  const [newNom, setNewNom] = useState("");
  const [newPrenom, setNewPrenom] = useState("");
  const [newTelephone, setNewTelephone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCodePromo, setNewCodePromo] = useState("");

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
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/user/getAll`
      );
      console.log(response.data.data);

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
      await axios.delete(`${process.env.REACT_APP_API_URL_PRODUCTION}api/user/${id}`);
      message.success("User deleted successfully!");
      console.log("User deleted successfully!");

      getUsers(); // Refresh the product list after deletion
    } catch (error) {
      message.error("Failed to delete User");
      console.error(error);
    }
  };

  const createUser = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/internUser/create`,
        {
          nom: newNom,
          prenom: newPrenom,
          telephone: newTelephone,
          codePromo: newCodePromo
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

  const resetCreateForm = () => {
    setNewNom("");
    setNewPrenom("");
    setNewTelephone("");
    setNewCodePromo("");
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
      render: (role) => (
        <Select
          defaultValue={role}
          style={{ width: 100 }}
          // onChange={(newStatus) => handleStatusChange(record.orderId, newStatus)}
        >
          <Option value="En Cours">Admin</Option>
          <Option value="Validé">Editor</Option>
          <Option value="Livré">Viewer</Option>
        </Select>
      )
    },
    {
      title: "status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) =>
        isActive ? <Tag color="green">Activer</Tag> : <Tag color="red">Desactiver</Tag>
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
              { name: "Liste des Utilisateur", path: "/internuser" },
              { name: "Utilisateur" }
            ]}
          />
        </Box>
      </div>
      <Divider orientation="left" style={{ fontWeight: "700" }}>
        Utilisateurs Internes
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
          Create User
        </Button>
      </div>
      <Table columns={columns} dataSource={internUsers} />

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
          <label style={{ fontWeight: "700" }}>Nom :</label>
          <Input value={newNom} onChange={(e) => setNewNom(e.target.value)} placeholder="Nom" />
        </div>
        <div
          style={{
            marginBottom: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "5px"
          }}
        >
          <label style={{ fontWeight: "700" }}>Prenom :</label>
          <Input
            value={newPrenom}
            onChange={(e) => setNewPrenom(e.target.value)}
            placeholder="Prenom"
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
          <label style={{ fontWeight: "700" }}>Telephone :</label>
          <Input
            value={newTelephone}
            onChange={(e) => setNewTelephone(e.target.value)}
            placeholder="Telephone"
          />
        </div>
      </Modal>
    </div>
  );
};

export default Users;
