import { Card } from "antd";
import Meta from "antd/es/card/Meta";
import axios from "axios";
import React from "react";
import { useState } from "react";
import OneBanner from "./OneBanner";
import { useEffect } from "react";
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
  useEffect(() => {
    getBanners();
  }, []);
  return (
    <div>
      <Toaster richColors />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        {banners.map((banner) => (
          <OneBanner banner={banner} />
        ))}
      </div>
    </div>
  );
};

export default Banners;
