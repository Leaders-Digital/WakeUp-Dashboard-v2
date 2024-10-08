import { Col, Table, Tag, message, Select, Divider, Row, Card, Statistic, Rate } from "antd";
import axios from "axios";
import { Box } from "@mui/material";
import React, { useEffect, useState, useMemo } from "react";
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined
} from "@ant-design/icons"; // Updated import
import { Breadcrumb } from "app/components";
import dayjs from "dayjs"; // Import dayjs for date formatting

const { Option } = Select;

const Avis = () => {
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState(null); // New state for filtering

  const fetchAvis = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/review/getReview`
      );

      setAvis(response.data.response.reverse());
      setLoading(false);
    } catch (error) {
      console.error("Échec de la récupération des Avis:", error);
      message.error("Échec de la récupération des Avis.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvis();
  }, []);

  const handleStatusChange = async (reviewId, accepted) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/review/updateAcceptedStatus`,
        { reviewId, accepted }
      );
      message.success(response.data.message);
      fetchAvis(); // Refresh the reviews
    } catch (error) {
      console.error("Échec de la mise à jour du statut:", error);
      message.error("Échec de la mise à jour du statut.");
    }
  };

  // Calculate counts using useMemo for optimization
  const totalReviews = useMemo(() => avis.length, [avis]);

  const acceptedReviews = useMemo(() => avis.filter((review) => review.accepted).length, [avis]);

  const nonAcceptedReviews = useMemo(
    () => avis.filter((review) => !review.accepted).length,
    [avis]
  );

  // Filtered data based on filterStatus
  const filteredAvis = useMemo(() => {
    if (filterStatus === null) return avis;
    if (filterStatus === true) return avis.filter((review) => review.accepted);
    if (filterStatus === false) return avis.filter((review) => !review.accepted);
    return avis;
  }, [avis, filterStatus]);

  const columns = [
    {
      title: "Nom",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email"
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => dayjs(createdAt).format("DD/MM/YYYY") // Format the date
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => <Rate disabled defaultValue={rating} /> // Display stars for the rating
    },
    {
      title: "Commentaire",
      dataIndex: "comment",
      key: "comment"
    },
    {
      title: "Accepté",
      dataIndex: "accepted",
      key: "accepted",
      render: (accepted, record) => (
        <Select
          defaultValue={accepted ? "Oui" : "Non"}
          onChange={(value) => handleStatusChange(record._id, value === "Oui")}
          style={{ width: 100 }}
        >
          <Option value="Oui">Oui</Option>
          <Option value="Non">Non</Option>
        </Select>
      )
    }
  ];

  const handleViewClick = (avis) => {
    // Implement your view logic here
    console.log("View Avis:", avis);
  };

  // Handlers for filtering
  const handleFilter = (status) => {
    setFilterStatus(status);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "10px" }}>
        <Box className="breadcrumb">
          <Breadcrumb
            routeSegments={[{ name: "Liste des avis", path: "/avis" }, { name: "Avis" }]}
          />
        </Box>
      </div>

      <Row gutter={16} style={{ marginBottom: "20px" }}>
        <Col xs={24} xl={8} style={{ marginBottom: "20px" }}>
          <Card
            title="Nombre des avis"
            bordered={false}
            onClick={() => handleFilter(null)}
            style={{ cursor: "pointer" }}
          >
            <Statistic value={totalReviews} />
          </Card>
        </Col>
        <Col xs={24} xl={8} style={{ marginBottom: "20px" }}>
          <Card
            title="Avis Acceptés"
            bordered={false}
            onClick={() => handleFilter(true)}
            style={{ cursor: "pointer" }}
          >
            <Statistic value={acceptedReviews} valueStyle={{ color: "#3f8600" }} />
          </Card>
        </Col>
        <Col xs={24} xl={8} style={{ marginBottom: "20px" }}>
          <Card
            title="Avis Non Acceptés"
            bordered={false}
            onClick={() => handleFilter(false)}
            style={{ cursor: "pointer" }}
          >
            <Statistic value={nonAcceptedReviews} valueStyle={{ color: "#cf1322" }} />
          </Card>
        </Col>
      </Row>

      <Divider orientation="left" style={{ fontWeight: "700" }}>
        Liste des avis
      </Divider>

      <Col xs={24} xl={24}>
        <Table
          columns={columns}
          dataSource={filteredAvis}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          bordered
          scroll={{ x: "max-content" }}
        />
      </Col>
    </div>
  );
};

export default Avis;
