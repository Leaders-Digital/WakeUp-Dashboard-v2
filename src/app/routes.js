import { lazy } from "react";
import { Navigate } from "react-router-dom";

import AuthGuard from "./auth/AuthGuard";
import { authRoles } from "./auth/authRoles";

import Loadable from "./components/Loadable";
import MatxLayout from "./components/MatxLayout/MatxLayout";

import materialRoutes from "app/views/material-kit/MaterialRoutes";
import { element } from "prop-types";
import Productlist from "./Pages/Products/Productlist";
import Addproduct from "./Pages/Products/Addproduct";
import Orderlist from "./Pages/Orders/Orderlist";
import AddBlog from "./Pages/Blog/AddBlog";
import AddinternUser from "./Pages/Utilisateurinterne/AddinternUser";
import Reclamation from "./Pages/Reclamation/Reclamation";
import Banners from "./Pages/Banners/Banners";
import UpdateProduct from "./Pages/Products/UpdateProduct";
import DetailOrder from "./Pages/Orders/DetailOrder";
import DetailProduct from "./Pages/Products/DetailProduct";
import Users from "./Pages/Users/Users";
import SubscriptionList from "./Pages/Subscribe/Subscribe";
import OrdersLivre from "./Pages/Orders/OrdersLivre";

// SESSION PAGES
const NotFound = Loadable(lazy(() => import("app/views/sessions/NotFound")));
const JwtLogin = Loadable(lazy(() => import("app/views/sessions/JwtLogin")));
const JwtRegister = Loadable(lazy(() => import("app/views/sessions/JwtRegister")));
const ForgotPassword = Loadable(lazy(() => import("app/views/sessions/ForgotPassword")));
// E-CHART PAGE
const AppEchart = Loadable(lazy(() => import("app/views/charts/echarts/AppEchart")));
// DASHBOARD PAGE
const Analytics = Loadable(lazy(() => import("app/views/dashboard/Analytics")));

const routes = [
  {
    element: (
      <AuthGuard>
        <MatxLayout />
      </AuthGuard>
    ),
    children: [
      ...materialRoutes,
      // dashboard route
      { path: "/dashboard/default", element: <Analytics />, auth: authRoles.admin },
      // e-chart route
      { path: "/charts/echarts", element: <AppEchart />, auth: authRoles.editor },
      { path: "/produit/liste", element: <Productlist /> },
      // produit pages route
      { path: "/produit/liste", element: <Productlist /> },
      { path: "/produit/ajouter", element: <Addproduct /> },
      { path: "/produit/modifier", element: <UpdateProduct /> },
      { path: "/produit/details", element: <DetailProduct /> },

      // commande pages route
      { path: "/commande/liste", element: <Orderlist /> },
      { path: "/commande/livre", element: <OrdersLivre /> },
      { path: "/commande/details/*", element: <DetailOrder /> },

      // Blog pages route
      { path: "/blog", element: <AddBlog /> },

      // user interne pages route
      { path: "/internuser", element: <AddinternUser /> },

      // Reclamtion pages route
      { path: "/reclamation", element: <Reclamation /> },

      // Banners pages route
      { path: "/banners", element: <Banners /> },

      // users pages route
      { path: "/users", element: <Users /> },

      // subscribe pages route
      { path: "/SubscriptionList", element: <SubscriptionList /> }
    ]
  },

  // session pages route
  { path: "/session/404", element: <NotFound /> },
  { path: "/session/signin", element: <JwtLogin /> },
  { path: "/session/signup", element: <JwtRegister /> },
  { path: "/session/forgot-password", element: <ForgotPassword /> },

  { path: "/", element: <Navigate to="dashboard/default" /> },
  { path: "*", element: <NotFound /> }
];

export default routes;
