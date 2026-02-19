import React from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import { i18n } from "@/src/i18n";
import "../../src/styles/globals.css";
import AppLayout from "@/src/components/layout/AppLayout";
import SettingsPage from "@/src/pages/SettingsPage";
import HistoryPage from "@/src/pages/HistoryPage";

const router = createHashRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "history",
        element: <HistoryPage />,
      },
    ],
  },
]);

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <RouterProvider router={router} />
    </I18nextProvider>
  </React.StrictMode>,
);
