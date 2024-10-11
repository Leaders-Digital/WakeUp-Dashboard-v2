import { Card, Tabs } from "antd";
import Meta from "antd/es/card/Meta";
import axios from "axios";
import React, { useState, useEffect } from "react";
import OneBanner from "./OneBanner";
import { Toaster } from "sonner";

const Banners = () => {
  const [banners, setBanners] = useState([]);

  const getBanners = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL_PRODUCTION}api/banner/get`);
      setBanners(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const onChange = (key) => {
    console.log(key);
  };

  useEffect(() => {
    getBanners();
  }, []);

  const items = banners.map((banner) => {
    return {
      key: banner._id,
      label: banner.name,
      children: <OneBanner banner={banner} />
    };
  });
  console.log(items);

  return (
    <div>
      <Toaster richColors />
      <div style={{ padding: "20px" }}>
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
      </div>
    </div>
  );
};

export default Banners;
