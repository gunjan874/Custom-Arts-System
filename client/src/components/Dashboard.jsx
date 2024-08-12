import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { motion } from 'framer-motion';
import CustomButton from '../components/CustomButton'; // Ensure CustomButton is imported correctly
import { fadeAnimation } from '../config/motion';

const Dashboard = () => {
  const { user } = useUser();
  const [images, setImages] = useState([]);
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    if (user) {
      const fetchImages = async () => {
        try {
          const response = await axios.get('http://localhost:8080/api/capture/user/images', {
            params: { userId: user.id }, // Sending userId as a query parameter
          });
          
          setImages(response.data);
        } catch (error) {
          console.error('Error fetching images:', error);
        }
      };

      fetchImages();
    }
  }, [user]);

  if (!user) {
    return <div>Loading...</div>; // Show loading indicator while user data is being fetched
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg flex items-center space-x-6 mb-8">
        <img 
          src={user.imageUrl} 
          alt="User Profile" 
          className="w-32 h-32 rounded-full"
        />
        <div>
          <h2 className="text-2xl font-bold">{user.fullName}</h2>
          <p className="text-sm mt-2">{user.primaryEmailAddress.emailAddress}</p>
          <p className="text-sm">{user.primaryPhoneNumber || 'N/A'}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-semibold mb-4">Your Images</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image) => (
            <div key={image._id} className="border rounded-lg overflow-hidden">
              <img 
                src={image.url} 
                alt={`Image ${image._id}`} 
                className="w-full h-auto"
              />
              <div className="p-2 text-center">
                <a 
                  href={image.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline"
                >
                  View Full Image
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <motion.div
        className="fixed bottom-5 right-5"
        {...fadeAnimation}
      >
        <CustomButton
          type="filled"
          title="Go Back"
          handleClick={() => navigate('/edit')} // Navigate to /edit page
          customStyles="w-fit px-4 py-2.5 font-bold text-sm"
        />
      </motion.div>
    </div>
  );
};

export default Dashboard;
