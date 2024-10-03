import React, { useEffect, useState } from "react";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { Button, Card, Col, Divider, message, Row, Table, Modal, Input } from "antd";
import axios from "axios";
import { Box } from "@mui/material";
import { Breadcrumb } from "app/components";

const { Search } = Input;

const { confirm } = Modal;

const AddinternUser = () => {
  const [internUsers, setInternUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // For the search term

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // For create modal

  // Update form states
  const [updateNom, setUpdateNom] = useState("");
  const [updatePrenom, setUpdatePrenom] = useState("");
  const [updateTelephone, setUpdateTelephone] = useState("");
  const [updateEmail, setUpdateEmail] = useState("");
  const [updateCodePromo, setUpdateCodePromo] = useState("");
  const [updateId, setUpdateId] = useState("");

  // Create form states
  const [newNom, setNewNom] = useState("");
  const [newPrenom, setNewPrenom] = useState("");
  const [newTelephone, setNewTelephone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCodePromo, setNewCodePromo] = useState("");

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    updateUser();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const showCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateOk = () => {
    createUser();
  };

  const handleCreateCancel = () => {
    setIsCreateModalOpen(false);
  };

  const getInternUsers = async (search = "") => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/internUser/getInternUser`,
        {
          params: { search } // Send search as a general query parameter
        }
      );
      setInternUsers(response.data.data);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    getInternUsers();
  }, []);

  const deleteProduct = async (id) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/internUser/deleteInternUser/${id}`
      );
      message.success("User deleted successfully!");
      getInternUsers(); // Refresh the product list after deletion
    } catch (error) {
      message.error("Failed to delete User");
      console.error(error);
    }
  };

  const updateUser = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/internUser/updateInternUser/${updateId}`,
        {
          nom: updateNom,
          prenom: updatePrenom,
          telephone: updateTelephone
        }
      );
      if (response) {
        message.success("User updated successfully!");
        getInternUsers();
        setIsModalOpen(false);
      } else {
        message.error("Failed to update User");
      }
    } catch (error) {
      message.error("Failed to update User");
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
        getInternUsers();
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
      title: "Nom",
      dataIndex: "nom",
      key: "nom"
    },
    {
      title: "Prenom",
      dataIndex: "prenom",
      key: "prenom"
    },
    {
      title: "Telephone",
      dataIndex: "telephone",
      key: "telephone"
    },
    {
      title: "Code Promo",
      dataIndex: "codePromo",
      key: "codePromo"
    },
    {
      title: "Action",
      dataIndex: "id",
      render: (text, user) => (
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              showModal();
              setUpdateId(user._id);
              setUpdateNom(user.nom);
              setUpdatePrenom(user.prenom);
              setUpdateEmail(user.email);
              setUpdateTelephone(user.telephone);
              setUpdateCodePromo(user.codePromo);
            }}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(user)}
          />
        </div>
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
      {/* <Row gutter={16}>
        <Col xs={24} xl={6}>
          <Card title="Total Commandes" bordered={false}>
            <h2></h2>
          </Card>
        </Col>
        <Col xs={24} xl={6}>
          <Card title="Commandes En Cours" bordered={false}>
            <h2></h2>
          </Card>
        </Col>
        <Col xs={24} xl={6}>
          <Card title="Commandes Livrées" bordered={false}>
            <h2></h2>
          </Card>
        </Col>
        <Col xs={24} xl={6}>
          <Card title="Commandes Annulées" bordered={false}>
            <h2></h2>
          </Card>
        </Col>
      </Row> */}
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
            getInternUsers(e.target.value); // Trigger search as user types
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

      {/* Update Modal */}
      <Modal title="Editer User" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        {/* Update User form fields */}
        <div
          style={{
            marginBottom: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "5px"
          }}
        >
          <label style={{ fontWeight: "700" }}>Nom :</label>
          <Input
            value={updateNom}
            onChange={(e) => setUpdateNom(e.target.value)}
            placeholder="Nom"
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
          <label style={{ fontWeight: "700" }}>Prenom :</label>
          <Input
            value={updatePrenom}
            onChange={(e) => setUpdatePrenom(e.target.value)}
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
            value={updateTelephone}
            onChange={(e) => setUpdateTelephone(e.target.value)}
            placeholder="Telephone"
          />
        </div>
      </Modal>

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

export default AddinternUser;
