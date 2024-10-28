import { Box } from "@mui/material";
import { Card, Col, DatePicker, Divider, Input, message, Row, Select, Table, Tag } from "antd";
import { EyeOutlined } from "@ant-design/icons"; // Add the Eye Icon
import { Option } from "antd/es/mentions";
import { Breadcrumb } from "app/components";
import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
const Orderlist = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous"); // Initialize with "Tous"
  const [dateRange, setDateRange] = useState([]);
  const { RangePicker } = DatePicker;
  const navigate = useNavigate();
  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL_PRODUCTION}api/order/`, {
        headers: {
          "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
        }
      });
      const fetchedOrders = response.data.data;
      const formattedOrders = fetchedOrders.reverse().map((order) => ({
        key: order._id,
        orderId: order._id,
        customerName: `${order.nom} ${order.prenom}`,
        product: order.listeDesProduits.map((item) => item.variant).join(", "),
        quantity: order.listeDesProduits.reduce((acc, item) => acc + item.quantite, 0),
        status: order.statut // Use the 'statut' field from the backend
        // date: order.createdAt ? moment(order.createdAt) : null // Assuming you have 'createdAt'
      }));
      setOrders(formattedOrders);
      setFilteredOrders(formattedOrders);
      setLoading(false);
    } catch (error) {
      message.error("Failed to fetch orders");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    filterOrders(searchTerm, value, dateRange);
  };
  const handleDateFilter = (dates) => {
    setDateRange(dates);
    filterOrders(searchTerm, statusFilter, dates);
  };
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    filterOrders(value, statusFilter, dateRange);
  };

  const filterOrders = (searchTerm, status, dates) => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter((order) => order.customerName.toLowerCase().includes(searchTerm));
    }

    // Modify this condition to check for "Tous"
    if (status && status !== "Tous") {
      filtered = filtered.filter((order) => order.status === status);
    }

    if (dates.length) {
      filtered = filtered.filter((order) =>
        moment(order.date).isBetween(dates[0], dates[1], null, "[]")
      );
    }

    setFilteredOrders(filtered);
  };

  const statusColors = {
    Annulé: "red",
    Validé: "blue",
    livré: "green",
    "en cours": "orange"
  };
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/order/${orderId}/status`,
        {
          statut: newStatus // Send the updated status to the backend
        },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
          }
        }
      );
      message.success("Statut de la commande mis à jour avec succès");

      // Update the orders state after successful status change
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId ? { ...order, status: newStatus } : order
        )
      );
      fetchOrders();
    } catch (error) {
      message.error("Erreur lors de la mise à jour du statut de la commande");
    }
  };
  const columns = [
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId"
    },
    {
      title: "Nom client",
      dataIndex: "customerName",
      key: "customerName"
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity"
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={statusColors[status] || "default"}>{status}</Tag>
    },

    {
      title: "Détails",
      key: "details",
      render: (_, record) => (
        <EyeOutlined
          style={{ fontSize: "18px", cursor: "pointer" }}
          onClick={() => {
            navigate("/commande/details", { state: { orderId: record.orderId } });
          }}
        />
      )
    },
    {
      title: "Changer le Statut",
      dataIndex: "status",
      key: "statusChange",
      render: (status, record) => (
        <Select
          defaultValue={status}
          style={{ width: 120 }}
          onChange={(newStatus) => handleStatusChange(record.orderId, newStatus)}
        >
          <Option value="en cours">En Cours</Option>
          <Option value="validé">Validé</Option>
          <Option value="annulé">Annulé</Option>
          <Option value="livré">Livré</Option>
        </Select>
      )
    }
  ];

  return (
    <div style={{ padding: "20px" }}>
      {/* navigation box */}
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: "Liste Commande", path: "/commande/liste" },
            { name: "Commande" }
          ]}
        />
      </Box>
      {/* calculating box  */}
      <div style={{ marginTop: "20px", justifyContent: "center", alignItems: "center" }}>
        <Row gutter={16} style={{ display: "flex", justifyContent: "space-evenly" }}>
          <Col xs={24} xl={6}>
            <Card title="Total Commandes" bordered={false}>
              <h2 style={{ textAlign: "center" }}>{orders.length}</h2>
            </Card>
          </Col>
          <Col xs={24} xl={6}>
            <Card title="Commandes En Cours" bordered={false}>
              <h2 style={{ textAlign: "center" }}>
                {orders.filter((order) => order.status === "En Cours").length}
              </h2>
            </Card>
          </Col>
          {/* <Col xs={24} xl={6}>
            <Card title="Commandes Livrées" bordered={false}>
              <h2 style={{ textAlign: "center" }}>
                {orders.filter((order) => order.status === "Livré").length}
              </h2>
            </Card>
          </Col> */}
          <Col xs={24} xl={6}>
            <Card title="Commandes Annulées" bordered={false}>
              <h2 style={{ textAlign: "center" }}>
                {orders.filter((order) => order.status === "Annulé").length}
              </h2>
            </Card>
          </Col>
        </Row>
      </div>

      <Divider orientation="left">Nos Commandes</Divider>

      <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
        <Col span={8}>
          <Input placeholder="Search by customer name" onChange={handleSearch} value={searchTerm} />
        </Col>
        <Col span={8}>
          <Select
            placeholder="Filtrer par statut"
            onChange={handleStatusFilter}
            allowClear
            style={{ width: "100%" }}
          >
            <Option value="Tous">Tous</Option> {/* Ajout de l'option "Tous" */}
            <Option value="En Cours">En Cours</Option>
            <Option value="Validé">Validé</Option>
            <Option value="Annulé">Annulé</Option>
            <Option value="Livré">Livré</Option>
          </Select>
        </Col>
        <Col span={8}>
          <RangePicker onChange={handleDateFilter} format="YYYY-MM-DD" style={{ width: "100%" }} />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredOrders}
        loading={loading}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default Orderlist;
