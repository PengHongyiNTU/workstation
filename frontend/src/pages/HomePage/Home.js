import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { AuthTest } from "../../AuthTest";

const Home = () => (
  <div>
    <h1>Home</h1>
    <p>Welcome to the ModelScope Home Page</p>
    <AuthTest />
  </div>
);

export default Home;