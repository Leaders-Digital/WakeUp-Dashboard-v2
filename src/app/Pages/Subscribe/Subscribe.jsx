import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Table,
  Divider,
  Tag,
  Input,
  Button // Import Button from Ant Design
} from "antd";
import axios from "axios";
import { message } from "antd";
import * as XLSX from "xlsx"; // Import xlsx library
import { Box } from "@mui/material";
import { Breadcrumb } from "app/components";

const { Search } = Input;

const SubscriptionList = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/subscribe/getAllSubscriptions`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
          }
        }
      );
      setSubscriptions(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Échec de la récupération des abonnements:", error);
      message.error("Échec de la récupération des abonnements.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const filteredSubscriptions = subscriptions.filter((sub) =>
    sub.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email)
    },
    {
      title: "Date d'abonnement",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => new Date(date).toLocaleString()
    }
  ];

  // Function to export data to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredSubscriptions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Subscriptions");

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Set width for the first column (change the value as needed)
      { wch: 30 } // Set width for the second column
      // Add more widths as necessary for your data
    ];
    worksheet["!cols"] = columnWidths;

    // Adjust row height (you may want to set a height for all rows)
    for (let rowIndex = 0; rowIndex < filteredSubscriptions.length; rowIndex++) {
      worksheet["!rows"] = worksheet["!rows"] || [];
      worksheet["!rows"][rowIndex] = { hpt: 30 }; // Set height for each row (change the value as needed)
    }

    // Generate buffer and create a link to download
    XLSX.writeFile(workbook, "subscriptions.xlsx");
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "10px" }}>
        <Box className="breadcrumb">
          <Breadcrumb
            routeSegments={[
              { name: "Liste des abonnés", path: "/SubscriptionList" },
              { name: "Les abonnés" }
            ]}
          />
        </Box>
      </div>
      <Row gutter={16}>
        <Col xs={24} xl={12} style={{ paddingBottom: "20px" }}>
          <Card title="Nombre des Abonnés">{subscriptions.length}</Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card title="Abonnés Récents">
            {subscriptions.slice(0, 1).map((sub) => (
              <Tag key={sub._id} color="#DE8C06" style={{ marginBottom: "5px" }}>
                {sub.email}
              </Tag>
            ))}
          </Card>
        </Col>
        <Col span={24}>
          <Divider orientation="left">Liste des Abonnements</Divider>
        </Col>
        <Col xs={24} xl={24}>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Search
                placeholder="Rechercher par e-mail"
                allowClear
                size="middle"
                onSearch={(value) => setSearchText(value)}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col span={6} offset={6}>
              <Button type="primary" onClick={exportToExcel} style={{ marginLeft: 8 }}>
                Exporter vers Excel
              </Button>
            </Col>
          </Row>
        </Col>
        <Col xs={24} xl={24}>
          <Table
            columns={columns}
            dataSource={filteredSubscriptions}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            loading={loading}
            bordered
          />
        </Col>
      </Row>
    </div>
  );
  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={16}>
        <Col xs={24} xl={12} style={{ paddingBottom: "20px" }}>
          <Card title="Nombre des Abonnés">{subscriptions.length}</Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card title="Abonnés Récents">
            {subscriptions.slice(0, 1).map((sub) => (
              <Tag key={sub._id} color="#DE8C06" style={{ marginBottom: "5px" }}>
                {sub.email}
              </Tag>
            ))}
          </Card>
        </Col>
        <Col span={24}>
          <Divider orientation="left">Liste des Abonnements</Divider>
        </Col>
        <Col xs={24} xl={24}>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Search
                placeholder="Rechercher par e-mail"
                allowClear
                size="middle"
                onSearch={(value) => setSearchText(value)}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col span={6} offset={6}>
              <Button type="primary" onClick={exportToExcel} style={{ marginLeft: 8 }}>
                Exporter vers Excel
              </Button>
            </Col>
          </Row>
        </Col>
        <Col xs={24} xl={24}>
          <Table
            columns={columns}
            dataSource={filteredSubscriptions}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            loading={loading}
            bordered
          />
        </Col>
      </Row>
    </div>
  );
};

export default SubscriptionList;
