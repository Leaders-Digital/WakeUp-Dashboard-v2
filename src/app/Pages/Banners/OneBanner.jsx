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

  // Gérer le changement d'image
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file)); // Mettre à jour l'aperçu avec l'image sélectionnée
    }
  };

  // Gérer l'opération d'enregistrement (peut inclure un appel API pour télécharger l'image)
  const handleSave = async () => {
    if (selectedFile) {
      // Vous pouvez maintenant envoyer l'image sélectionnée à votre serveur via un appel API
      const formData = new FormData();
      formData.append("picture", selectedFile);
      try {
        const res = await axios.put(
          `${process.env.REACT_APP_API_URL_PRODUCTION}api/banner/${banner._id}`,
          formData,
          {
            headers: {
              "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
            }
          }
        );
        toast.success("Bannière mise à jour avec succès");
      } catch (error) {
        toast.error("Erreur lors de la mise à jour de la bannière");
      }
    }
  };

  return (
    <Card
      hoverable
      style={{ margin: "30px" }}
      cover={
        <img
          alt="Bannière"
          style={{ width: "100%", height: "300px", objectFit: "cover" }}
          src={preview}
        />
      }
    >
      <Meta title={banner.name} />
      <input type="file" onChange={handleFileChange} />
      <Button type="primary" onClick={handleSave} style={{ marginTop: "10px" }}>
        Enregistrer
      </Button>
    </Card>
  );
};

export default OneBanner;
