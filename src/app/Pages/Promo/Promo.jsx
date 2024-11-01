import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, message, Switch, Row, Col, Card, Divider, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons'; // Import the delete icon
import axios from 'axios';
import moment from 'moment';
import { Box } from '@mui/material';
import { Breadcrumb } from "app/components";

const Promo = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/promo`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY
          }
        }
      );
      setPromoCodes(response.data);
    } catch (error) {
      message.error("Error fetching promo codes");
    }
  };

  const handleAddPromo = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/promo/create`,
        { ...values },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
          }
        }
      );
      setPromoCodes([...promoCodes, response.data]);
      setIsModalVisible(false);
      form.resetFields();
      message.success("Promo code added successfully");
    } catch (error) {
      message.error(error.response?.data?.message || "Error adding promo code");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePromo = async (id, isActive) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/promo/${id}`,
        { isActive },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
          }
        }
      );
      const updatedPromoCodes = promoCodes.map((promo) =>
        promo._id === id ? response.data : promo
      );
      setPromoCodes(updatedPromoCodes);
      message.success("Promo code updated successfully");
    } catch (error) {
      message.error(error.response?.data?.message || "Error updating promo code");
    }
  };

  // New delete function
  const handleDeletePromo = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/promo/${id}`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
          }
        }
      );
      setPromoCodes(promoCodes.filter(promo => promo._id !== id));
      message.success("Promo code deleted successfully");
    } catch (error) {
      message.error(error.response?.data?.message || "Error deleting promo code");
    }
  };

  // Calculate stats for the promo codes
  const totalPromoCodes = promoCodes.length;
  const activePromoCodesCount = promoCodes.filter(promo => promo.isActive).length;
  const inactivePromoCodesCount = totalPromoCodes - activePromoCodesCount;

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Valeur de Remise',
      dataIndex: 'discountValue',
      key: 'discountValue',
      render: (value) => `${value}%`,
    },
    {
      title: 'Date Expiration',
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      render: (date) => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Nombre de Fois Utilisé',
      dataIndex: 'timesUsed',
      key: 'timesUsed',
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch 
          checked={isActive} 
          onChange={(checked) => handleUpdatePromo(record._id, checked)} 
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Popconfirm
          title="Êtes-vous sûr de vouloir supprimer ce Code?"
          onConfirm={() => handleDeletePromo(record._id)}
          okText="Oui"
          cancelText="Non"
        >
          <Button icon={<DeleteOutlined />} type="text" danger />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "10px" }}>
        <Box className="breadcrumb">
          <Breadcrumb
            routeSegments={[{ name: "Liste des Partenaire", path: "/partenaire" }, { name: "Partenaire" }]}
          />
        </Box>
      </div>

      <Row gutter={16} style={{ marginBottom: "20px" }}>
        <Col xs={24} xl={8} style={{ marginBottom: "20px" }}>
          <Card title="Nombre de Promo code">
            {totalPromoCodes}
          </Card>
        </Col>
        <Col xs={24} xl={8} style={{ marginBottom: "20px" }}>
          <Card title="Promo code Actif">
            {activePromoCodesCount}
          </Card>
        </Col>
        <Col xs={24} xl={8} style={{ marginBottom: "20px" }}>
          <Card title="Promo code Inactif">
            {inactivePromoCodesCount}
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">
        Gestion Code Promo
      </Divider>

      <div style={{ width: "100%", display: "flex", justifyContent: "right", padding: "10px" }}>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Ajouter Promo Code
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={promoCodes}
        rowKey={(record) => record._id}
        style={{ marginTop: 20 }}
        scroll={{ x: "max-content" }}
      />

      <Modal
        title="Ajouter Nouveau CodePromo"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddPromo}
        >
          <Form.Item
            name="code"
            label="Promo Code"
            rules={[{ required: true, message: 'Please enter the promo code' }]}
          >
            <Input placeholder="Enter promo code" />
          </Form.Item>

          <Form.Item
            name="discountValue"
            label="Valeur de Remise (%)"
            rules={[{ required: true, message: 'Please enter a discount value' }]}
          >
            <InputNumber min={1} max={100} placeholder="Enter discount value" />
          </Form.Item>

          <Form.Item
            name="expirationDate"
            label="Date d'Expiration"
            rules={[{ required: true, message: 'Please select an expiration date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Ajouter
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Promo;
