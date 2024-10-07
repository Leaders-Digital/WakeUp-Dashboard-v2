import { Card, Button } from "antd";
import Meta from "antd/es/card/Meta";
import axios from "axios";
import React, { useState } from "react";
import { toast } from "sonner";

const OneBanner = ({ banner }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(
    `${process.env.REACT_APP_API_URL_PRODUCTION}` + banner.picture
  );

  // Handle file input change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file)); // Update preview with the selected image
    }
  };

  // Handle the save operation (can include an API call to upload the file)
  const handleSave = async () => {
    if (selectedFile) {
      // You can now send the selectedFile to your server via an API call
      console.log("File to be saved:", selectedFile);
      const formData = new FormData();
      formData.append("picture", selectedFile);
      try {
        const res = await axios.put(
          `${process.env.REACT_APP_API_URL_PRODUCTION}api/banner/${banner._id}`,
          formData
        );
        toast.success("Banner updated successfully");
        console.log(res);
      } catch (error) {
        toast.error("Error updating banner");
      }
    }
  };

  return (
    <Card
      hoverable
      style={{ margin: "30px" }}
      cover={
        <img
          alt="Banner"
          style={{ width: "100%", height: "300px", objectFit: "cover" }}
          src={preview}
        />
      }
    >
      <Meta title={banner.name} />
      <input type="file" onChange={handleFileChange} />
      <Button type="primary" onClick={handleSave} style={{ marginTop: "10px" }}>
        Save
      </Button>
    </Card>
  );
};

export default OneBanner;
