import { AnimatePresence, motion } from "framer-motion";
import { useSnapshot } from "valtio";
import state from "../store";
import CustomButton from "../components/CustomButton";
import {
  headContainerAnimation,
  headContentAnimation,
  headTextAnimation,
  slideAnimation,
} from "../config/motion";
import { SignedIn, SignedOut, useAuth, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const Home = ({ setShowKonva }) => {
  const snap = useSnapshot(state);
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  const handleCustomizeClick = () => {
    if (isSignedIn) {
      navigate("/edit"); // Redirect to the edit page if signed in
    } else {
      navigate("/sign-in"); // Redirect to the sign-in page if not signed in
    }

    // Update state to hide intro
    state.intro = false;
  };

  const handleLoginRegisterClick = () => {
    navigate("/sign-in"); // Redirect to the /signup route
  };

  return (
    <AnimatePresence>
      {snap.intro && (
        <motion.section className="home" {...slideAnimation("left")}>
          <motion.header
            {...slideAnimation("down")}
            className=" flex justify-between items-center px-4 py-2 "
          >
            <img
              src="./logo.gif"
              alt="logo"
              className="w-20 h-20 object-contain"
            />
            <div className="flex space-x-4">
              <SignedOut>
                <CustomButton
                  type="filled"
                  title="Login/Register"
                  handleClick={handleLoginRegisterClick}
                  customStyles="w-fit px-4 py-2.5 font-bold text-sm"
                />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </motion.header>

          <motion.div className="home-content" {...headContainerAnimation}>
            <motion.div {...headTextAnimation}>
              <h1 className="text-5xl md:text-7xl xl:text-8xl font-bold leading-tight">
                Custom <br className="xl:block hidden" />{" "}
                <span className="text-6xl md:text-7xl xl:text-8xl">
                  Art System
                </span>
              </h1>
            </motion.div>

            <motion.div
              {...headContentAnimation}
              className="flex flex-col gap-5"
            >
              <p className="max-w-md font-normal text-gray-600 text-base ">
                Create your unique and exclusive tshirt with our brand new 3D
                customization tool. <strong>Unleash your imagination</strong>{" "}
                and define your style.
              </p>
            </motion.div>
            <div className="flex gap-4">
              <CustomButton
                type="filled"
                title="Customize It"
                handleClick={handleCustomizeClick}
                customStyles="w-fit px-4 py-2.5 font-bold text-sm"
              />
              
            </div>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default Home;
