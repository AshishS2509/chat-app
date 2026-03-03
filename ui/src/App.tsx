// import { Provider } from "react-redux";
// import { store } from "./store";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router";
import ChatPage from "./pages/chat-page";
import NotFound from "./pages/not-found";
import ConfigProvider from "./config";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import { queryClient } from "./queries/config";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConfigProvider>
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ConfigProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
