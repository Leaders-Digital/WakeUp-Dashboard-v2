import { Box } from "@mui/material";
import { Col, Divider, DatePicker, Input, message, Row, Select, Table, Tag } from "antd";
import { Option } from "antd/es/mentions";
import { Breadcrumb } from "app/components";
import axios from "axios";
import { EyeOutlined } from "@ant-design/icons"; // Add the Eye Icon

import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OrdersLivre = () => {
  const { RangePicker } = DatePicker;

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]); // To hold filtered data
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/order/livre`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
          }
        }
      );
      const fetchedOrders = response.data.data;
      console.log(fetchedOrders,"hamma");
      
      const formattedOrders = fetchedOrders.reverse().map((order) => ({  

        key: order._id,
        orderId: order.orderCode,
        customerName: `${order.nom} ${order.prenom}`,
        product: order.listeDesProduits.map((item) => item.variant).join(", "),
        quantity: order.listeDesProduits.reduce((acc, item) => acc + item.quantite, 0),        
        status: order.statut
      }));
      setOrders(formattedOrders);
      setFilteredOrders(formattedOrders); // Initially show all orders
    } catch (error) {
      message.error("Failed to fetch orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = orders.filter((order) => order.customerName.toLowerCase().includes(value));
    setFilteredOrders(filtered); // Update filtered orders
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
      fetchOrders(); // Fetch updated orders
    } catch (error) {
      message.error("Erreur lors de la mise à jour du statut de la commande");
    }
  };

  const statusColors = {
    annulé: "red",
    validé: "blue",
    livré: "green",
    "en cours": "orange"
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
    // {
    //   title: "Détails",
    //   key: "details",
    //   render: (_, record) => (
    //     <EyeOutlined
    //       style={{ fontSize: "18px", cursor: "pointer" }}
    //       onClick={() => {
    //         navigate("/commande/details", {
    //           state: { orderId: record.orderId }
    //         });
    //       }}
    //     />
    //   )
    // },
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
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: "Commande livrés", path: "/commande/liste" },
            { name: "Commande" }
          ]}
        />
      </Box>
      <Divider orientation="left">Nos Commandes Livrés</Divider>
      <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
        <Col span={8}>
          <Input placeholder="Search by customer name" onChange={handleSearch} value={searchTerm} />
        </Col>
        {/* <Col span={8}>
          <RangePicker onChange={handleDateFilter} format="YYYY-MM-DD" style={{ width: "100%" }} />
        </Col> */}
      </Row>
      <Table
        columns={columns}
        dataSource={filteredOrders} // Use filtered orders
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default OrdersLivre;
