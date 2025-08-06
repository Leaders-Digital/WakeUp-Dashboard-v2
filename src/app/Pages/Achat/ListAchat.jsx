import React, { useState, useEffect } from 'react';
import { Table, Spin, Alert, Button, Input, Tag } from 'antd';
import { EyeOutlined, CheckCircleOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const ListAchat = () => {
    const [achats, setAchats] = useState([]);
    const [filteredAchats, setFilteredAchats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const fetchAchats = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL_PRODUCTION}api/achat`, {
                headers: { "x-api-key": process.env.REACT_APP_API_KEY },
            });
            setAchats(response.data.achats);
            setFilteredAchats(response.data.achats);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };
    // Fetch Achats from the API
    useEffect(() => {


        fetchAchats();
    }, []);

    // Handle search input change
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);

        // Filter achats based on the search input
        const filtered = achats.filter((achat) =>
            achat.numFacture.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredAchats(filtered);
    };

    const handleValidate = async (id) => {
        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL_PRODUCTION}api/achat/validate/${id}`, {}, {
                headers: { "x-api-key": process.env.REACT_APP_API_KEY },
            });
            fetchAchats();
        } catch (error) {
            console.error(error);

        }
    };

    // Define columns for the Table
    const columns = [
        {
            title: 'Numéro de Facture',
            dataIndex: 'numFacture',
            key: 'numFacture',
            align: 'center',
        },
        {
            title: 'Nombre de Produits',
            dataIndex: 'products',
            key: 'products',
            align: 'center',
            render: (products) => products.length,
        },
        {
            title: 'Prix Total',
            dataIndex: 'totalPrixAchat',
            key: 'totalPrixAchat',
            align: 'center',
        },
        {
            title: 'Créé le',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
            render: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: 'Mis à jour le',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            align: 'center',
            render: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: 'Validé',
            dataIndex: 'isValidated',
            key: 'isValidated',
            align: 'center',
            render: (isValidated) => (
                <Tag color={isValidated ? 'green' : 'red'}>
                    {isValidated ? 'Validé' : 'Non Validé'}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/achat/edit/${record._id}`)}
                    >
                        Voir
                    </Button>
                    {
                        record.isValidated ? null : (
                            <Button
                                icon={<CheckCircleOutlined />}
                                type="primary"
                                onClick={() => handleValidate(record._id)}
                            >
                                Valider
                            </Button>
                        )
                    }
                </div>
            ),
        },
    ];

    if (loading) return <Spin tip="Chargement..." />;
    if (error) return <Alert message="Erreur" description={error} type="error" showIcon />;

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ textAlign: 'center' }}>Liste des Achats</h1>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <Input
                    placeholder="Rechercher par Numéro de Facture"
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={handleSearch}
                    style={{ width: '50%' }}
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Table
                    dataSource={filteredAchats.map((achat) => ({ ...achat, key: achat._id }))}
                    columns={columns}
                    bordered
                    pagination={{ pageSize: 10 }}
                    style={{ width: '90%' }}
                />
            </div>
        </div>
    );
};

export default ListAchat;
