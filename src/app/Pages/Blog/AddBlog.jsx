import React, { useEffect, useState } from "react";
import OneBlog from "./OneBlog";
import axios from "axios";
import { Button } from "antd";
import CreerBlog from "./CreerBlog";
import BlogDetails from "./BlogDetails";
const AddBlog = () => {
  const [blog, setBlog] = useState([]);
  const getBlog = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL_PRODUCTION}api/blog/get`, {
        headers: {
          "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
        }
      });
      setBlog(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getBlog();
  }, []);
  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{ display: "flex", width: "100%", justifyContent: "right", marginBottom: "20px" }}
      >
        <CreerBlog getBlog={getBlog} />{" "}
      </div>
      {/* <BlogDetails/> */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center"
        }}
      >
        {blog.map((item) => (
          <OneBlog item={item} getBlog={getBlog} />
        ))}
      </div>
    </div>
  );
};

export default AddBlog;
