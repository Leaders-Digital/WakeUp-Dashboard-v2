import React, { useEffect, useState } from "react";
import {
    Card,
    Col,
    Row,
    Table,
    Divider,
    Tag,
    Input,
} from "antd";
import axios from "axios";
import { message } from "antd";

const { Search } = Input;

const SubscriptionList = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL_PRODUCTION}api/subscribe/getAllSubscriptions`
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

    const filteredSubscriptions = subscriptions.filter(sub =>
        sub.email.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            sorter: (a, b) => a.email.localeCompare(b.email),
            render: (text) => <a href={`mailto:${text}`}>{text}</a>,
        },
        {
            title: "Date d'abonnement",
            dataIndex: "createdAt",
            key: "createdAt",
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (date) => new Date(date).toLocaleString(),
        },
    ];

    return (
        <div style={{ padding: "20px" }}>
            <Row gutter={16}>
                <Col xs={24} xl={12} style={{paddingBottom:"20px"}}>
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
                        <Col xs={24} sm={12} md={8}>
                            <Search
                                placeholder="Rechercher par e-mail"
                                allowClear
                                size="middle"
                                onSearch={(value) => setSearchText(value)}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </Col>
                    </Row>
                </Col>
                <Col xs={24} xl={24}>
                    <Table
                        columns={columns}
                        dataSource={filteredSubscriptions} // Use filtered subscriptions here
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
