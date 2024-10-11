import React, { useRef, useState } from "react";
import { Input, message } from "antd";
// import holder from "../assets/images/holder.webp";
import axios from "axios";

const AddVariantModal = ({ productId, getProduct }) => {
  const [logo, setLogo] = useState(null);
  const [icon, setIcon] = useState(null);
  const [reference, setReference] = useState("");
  const [barcode, setBarcode] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState("");
  const fileInputRefLogo = useRef(null);
  const fileInputRefIcon = useRef(null);

  const handleLogoFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setLogo(selectedFile);
  };

  const handleIconFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setIcon(selectedFile);
  };

  const handleLogoClick = () => {
    fileInputRefLogo.current.click();
  };

  const handleIconClick = () => {
    fileInputRefIcon.current.click();
  };

  // Input validation
  const validateInputs = () => {
    if (!reference) {
      message.error("La référence est obligatoire.");
      return false;
    }
    if (!barcode) {
      message.error("Le code à barre est obligatoire.");
      return false;
    }
    if (!color) {
      message.error("La couleur est obligatoire.");
      return false;
    }
    if (!quantity || quantity <= 0) {
      message.error("La quantité doit être supérieure à 0.");
      return false;
    }
    if (!logo) {
      message.error("Le logo est obligatoire.");
      return false;
    }
    if (!icon) {
      message.error("L'icône est obligatoire.");
      return false;
    }
    return true;
  };

  // Function to send data
  const handleSubmit = async () => {
    if (!validateInputs()) {
      return;
    }

    // Create a FormData object
    const formData = new FormData();
    formData.append("reference", reference);
    formData.append("codeAbarre", barcode);
    formData.append("color", color);
    formData.append("quantity", quantity);
    formData.append("picture", logo); // logo file
    formData.append("icon", icon); // icon file
    formData.append("productId", productId);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_PRODUCTION}api/product/add-variant`,
        formData,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY // Include API key in the headers
          }
        }
      );

      if (response) {
        message.success("Variant ajouté avec succès !");
        // Optionally reset the form
        getProduct();
        setReference("");
        setBarcode("");
        setColor("");
        setQuantity("");
        setLogo(null);
        setIcon(null);
      } else {
        message.error("Échec de l'ajout du variant.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      message.error("Une erreur est survenue lors de l'ajout du variant.");
    }
  };

  return (
    <div
      className="modal fade"
      id="exampleModal"
      tabIndex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="exampleModalLabel">
              Ajouter des variants
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div
            className="modal-body"
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <Input
              type="text"
              placeholder="Réference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Code a barre"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Color"
              style={{ width: "30%" }}
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Quantité"
              style={{ width: "30%" }}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />

            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
              {/* Logo Section */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  position: "relative",
                  width: "30%",
                  flexDirection: "column",
                  gap: "20px"
                }}
              >
                <img
                  src={logo ? URL.createObjectURL(logo) : holder}
                  width={120}
                  alt="Upload Logo"
                  onClick={handleLogoClick}
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
                <input
                  type="file"
                  ref={fileInputRefLogo}
                  onChange={handleLogoFileChange}
                  style={{ display: "none" }}
                  accept="image/*"
                />
                <p style={{ fontSize: "14px" }}>Sélectionner photo</p>
              </div>

              {/* Icon Section */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  position: "relative",
                  width: "30%",
                  flexDirection: "column",
                  gap: "20px"
                }}
              >
                <img
                  src={icon ? URL.createObjectURL(icon) : holder}
                  width={120}
                  alt="Upload Icon"
                  onClick={handleIconClick}
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
                <input
                  type="file"
                  ref={fileInputRefIcon}
                  onChange={handleIconFileChange}
                  style={{ display: "none" }}
                  accept="image/*"
                />
                <p style={{ fontSize: "13px" }}>Sélectionner l'icône</p>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              data-bs-dismiss="modal"
              onClick={handleSubmit}
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVariantModal;
