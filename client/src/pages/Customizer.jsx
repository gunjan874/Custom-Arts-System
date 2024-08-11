import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSnapshot } from "valtio";
import axios from "axios";
import state from "../store";
import { downloadCanvasToImage } from "../config/helpers";
import { fadeAnimation, slideAnimation } from "../config/motion";
import CustomButton from "../components/CustomButton";
import { EditorTabs, DecalTypes, FilterTabs, Download } from "../config/constants";
import Tab from "../components/Tab";
import ColorPicker from "../components/ColorPicker";
import FilePicker from "../components/FilePicker";
import AIPicker from "../components/AIPicker";
import { useAuth } from "@clerk/clerk-react";

const Customizer = () => {
  const snap = useSnapshot(state);
  const { sessionId } = useAuth();

  const [file, setFile] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generatingImg, setGeneratingImg] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState();
  const [activeFilterTab, setActiveFilterTab] = useState({
    logoShirt: true,
    stylishShirt: false,
  });

  const generateTabContent = () => {
    switch (activeEditorTab) {
      case "colorpicker":
        return <ColorPicker />;
      case "filepicker":
        return <FilePicker file={file} setFile={setFile} readFile={readFile} />;
      case "aipicker":
        return (
          <AIPicker
            prompt={prompt}
            setPrompt={setPrompt}
            generatingImg={generatingImg}
            handleSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  const handlePayment = async () => {
    console.log("Buy Now button clicked");
    const amount = 500; // Set the amount

    try {
      // 1. Fetch Razorpay key from backend
      const keyResponse = await axios.get("http://localhost:8080/api/razorpay-key");
      const key = keyResponse.data.key;

      // 2. Create an order
      const orderResponse = await axios.post("http://localhost:8080/api/orders", { amount });
      const { id: order_id, amount: orderAmount, currency } = orderResponse.data;

      // 3. Initialize Razorpay
      const options = {
        key: key,
        amount: orderAmount,
        currency: currency,
        name: "Custom T-Shirt",
        description: "Thank you for your purchase",
        order_id: order_id,
        handler: async (response) => {
          const paymentId = response.razorpay_payment_id;

          // 4. Capture the image
          const image = downloadCanvasToImage();
          if (!image) {
            alert("No image available to upload!");
            return;
          }

          // Check image size (assuming image is a base64 string)
          const imageSizeInBytes = Math.ceil((image.length / 4) * 3);
          const imageSizeInMB = imageSizeInBytes / (1024 * 1024);
          if (imageSizeInMB > 10) { // Adjust this threshold as needed
            alert("Image size too large. Please use an image smaller than 10MB.");
            return;
          }

          // 5. Capture payment and upload image
          try {
            const captureResponse = await axios.post(
              `http://localhost:8080/api/capture/${paymentId}`,
              { amount, image },
              {
                headers: {
                  Authorization: `Bearer ${sessionId}`, // Use the session ID for authentication
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
              }
            );

            if (captureResponse.data.imageUrl) {
              alert("Payment successful and image uploaded!");
            } else {
              alert("Payment successful but image upload failed");
            }
          } catch (uploadError) {
            if (uploadError.response && uploadError.response.status === 413) {
              alert("Image too large to upload. Please try a smaller image.");
            } else if (uploadError.response && uploadError.response.data) {
              alert(`Payment successful but upload failed: ${uploadError.response.data}`);
            } else {
              alert(`Payment successful but upload failed: ${uploadError.message}`);
            }
          }
        },
        prefill: {
          name: "John Doooe",
          email: "john@example.com",
          contact: "9999999789",
        },
        notes: {
          address: "Custom T-Shirt Address",
        },
        theme: {
          color: "#F37254",
        },
      };

      // Check if Razorpay is loaded
      if (typeof window.Razorpay === 'undefined') {
        throw new Error("Razorpay SDK is not loaded");
      }

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      alert(`Payment failed: ${error.response ? error.response.data : error.message}`);
    }
  };

  const handleSubmit = async (type) => {
    if (!prompt) return alert("Please enter the prompt!");

    try {
      setGeneratingImg(true);

      const response = await fetch("http://localhost:8080/api/v1/dalle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      handleDecal(type, `data:image/png;base64,${data.photo}`);
    } catch (error) {
      alert(error);
    } finally {
      setGeneratingImg(false);
      setActiveEditorTab("");
    }
  };

  const handleDecal = (type, res) => {
    const decalType = DecalTypes[type];
    state[decalType.stateProperty] = res;

    if (!activeFilterTab[decalType.filterTab]) {
      handleActiveFilterTab(decalType.filterTab);
    }
  };

  const handleActiveFilterTab = (tabName) => {
    switch (tabName) {
      case "logoShirt":
        state.isLogoTexture = !activeFilterTab[tabName];
        break;
      case "stylishShirt":
        state.isFullTexture = !activeFilterTab[tabName];
        break;
      default:
        state.isLogoTexture = true;
        state.isFullTexture = false;
        break;
    }

    setActiveFilterTab((prevState) => {
      return {
        ...prevState,
        [tabName]: !prevState[tabName],
      };
    });
  };

  const readFile = (type) => {
    reader(file).then((res) => {
      handleDecal(type, res);
      setActiveEditorTab("");
    });
  };

  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
          <motion.div
            key="custom"
            className="absolute top-0 left-0 z-10"
            {...slideAnimation("left")}
          >
            <div className="flex items-center min-h-screen">
              <div className="editortabs-container tabs">
                {EditorTabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    tab={tab}
                    handleClick={() => {
                      setActiveEditorTab(tab.name);
                    }}
                  />
                ))}
                {generateTabContent()}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute z-10 top-5 right-5"
            {...fadeAnimation}
          >
            <CustomButton
              type="filled"
              title="Go Back"
              handleClick={() => (state.intro = true)}
              customStyles="w-fit px-4 py-2.5 font-bold text-sm"
            />
          </motion.div>

          <motion.div
            className="filtertabs-container tabs"
            {...slideAnimation("up")}
          >
            {FilterTabs.map((tab) => (
              <Tab
                key={tab.name}
                tab={tab}
                isFilterTab
                isActiveTab={activeFilterTab[tab.name]}
                handleClick={() => handleActiveFilterTab(tab.name)}
              />
            ))}

            {Download.map((tab) => (
              <Tab
                tab={tab}
                key={tab.name}
                isActiveTab={activeFilterTab[tab.name]}
                handleClick={() => downloadCanvasToImage()}
              />
            ))}
          </motion.div>

          {/* Razorpay Payment Button */}
          <motion.div
            className="absolute z-10 bottom-5 right-5"
            {...fadeAnimation}
          >
            <CustomButton
              type="filled"
              title="Buy Now"
              handleClick={handlePayment}
              customStyles="w-fit px-4 py-2.5 font-bold text-sm"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Customizer;
