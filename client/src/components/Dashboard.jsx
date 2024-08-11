import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      const token = localStorage.getItem('clerkToken'); // Adjust as per your token storage method
      const response = await axios.get("http://localhost:8080/api/user/images", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setImages(response.data);
    };

    fetchImages();
  }, []);

  return (
    <div>
      <h1>Your Purchased Images</h1>
      <div>
        {images.map((image) => (
          <div key={image._id}>
            <img src={image.url} alt="Purchased item" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
