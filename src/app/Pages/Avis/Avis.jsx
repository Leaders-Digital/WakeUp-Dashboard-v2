import {
  Col,
  Table,
  Tag,
  message,
  Select,
  Divider,
  Row,
  Card,
  Statistic,
  Rate,
  Button,
  Modal,
  Space
} from "antd";
import axios from "axios";
import { Box } from "@mui/material";
import React, { useEffect, useState, useMemo } from "react";
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  DeleteOutlined
} from "@ant-design/icons";
import { Breadcrumb } from "app/components";
import dayjs from "dayjs";

const { Option } = Select;

const Avis = () => {
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState({});
  const fetchAvis = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/review/getReview`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY
          }
        }
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

  const handleDeleteReviews = async (review) => {
    setDeleteModalVisible(false);

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/review/deleteReview/`, // Correct URL
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY // Ensure the API key is sent in headers
          },
          data: { reviewIds: review._id, productId: review.productId._id } // Move data here
        }
      );

      message.success("Avis supprimés avec succès!");
      fetchAvis();
    } catch (error) {
      console.error("Échec de la suppression des avis:", error);
      message.error("Échec de la suppression des avis.");
    }
  };

  const handleStatusChange = async (reviewId, accepted) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/review/updateAcceptedStatus`,
        { reviewId, accepted },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY
          }
        }
      );
      message.success(response.data.message);
      fetchAvis();
    } catch (error) {
      console.error("Échec de la mise à jour du statut:", error);
      message.error("Échec de la mise à jour du statut.");
    }
  };

  const showDeleteConfirm = (review) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      // content: `Êtes-vous sûr de vouloir supprimer ${selectedReviewIds.length} avis?`,
      okText: "Oui",
      okType: "danger",
      cancelText: "Non",
      onOk: () => {
        handleDeleteReviews(review);
      }
    });
  };

  const totalReviews = useMemo(() => avis.length, [avis]);

  const acceptedReviews = useMemo(() => avis.filter((review) => review.accepted).length, [avis]);

  const nonAcceptedReviews = useMemo(
    () => avis.filter((review) => !review.accepted).length,
    [avis]
  );

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
      render: (createdAt) => dayjs(createdAt).format("DD/MM/YYYY")
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => <Rate disabled defaultValue={rating} />
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
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, review) => (
        <Space size="middle">
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              showDeleteConfirm(review);
            }}
          />
        </Space>
      ),
      align: "center",
      width: 100
    }
  ];

  const handleClick = (review) => {
    setSelectedReview({ ...review });
  };
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
