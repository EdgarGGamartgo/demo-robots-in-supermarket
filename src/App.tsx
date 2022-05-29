import React from "react";
import StoreMapComponent from "./components/StoreMapComponent";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <StoreMapComponent />
      </QueryClientProvider>
    </Router>
  );
}

export default App;
