import { Provider } from "react-redux";
import { store } from "./store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router";
import ChatPage from "./pages/chat-page";
import NotFound from "./pages/not-found";
import ConfigProvider from "./config";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
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
    </Provider>
  );
}

export default App;
