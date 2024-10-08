export const navigations = [
  { name: "Dashboard", path: "/dashboard/default", icon: "dashboard" },
  // { name: "Dashboard", path: "/dashboard/default", icon: "dashboard" },
  // { label: "Produit", type: "label" },
  {
    name: "Produits",
    icon: "shopping_basket",
    children: [
      { name: "Liste Produits", iconText: "SI", path: "/produit/liste" },
      { name: "Ajouter Produit", iconText: "SU", path: "/produit/ajouter" }
    ]
  },

  {
    name: "Commandes",
    icon: "shopping_cart",
    children: [
      { name: "Liste Commandes", iconText: "SI", path: "/commande/liste" },
      { name: "Commandes Livrés", iconText: "SI", path: "/commande/livre" }
      // { name: "Commandes Details", iconText: "SU", path: "/commande/details" }
    ]
  },

  { name: "Blog", path: "/blog", icon: "font_download" },
  { name: "Utilisateurs internes", path: "/internuser", icon: "contacts" },
  { name: "Les réclamations", path: "/reclamation", icon: "question_answer" },
  { name: "Banners", path: "/banners", icon: "panorama" },
  { name: "Les utilisateur", path: "/users", icon: "group" },
  { name: "Liste des abonnés", path: "/SubscriptionList", icon: "local_post_office" }

  // { label: "Components", type: "label" },
  // {
  //   name: "Components",
  //   icon: "favorite",
  //   badge: { value: "30+", color: "secondary" },
  //   children: [
  //     { name: "Auto Complete", path: "/material/autocomplete", iconText: "A" },
  //     { name: "Buttons", path: "/material/buttons", iconText: "B" },
  //     { name: "Checkbox", path: "/material/checkbox", iconText: "C" },
  //     { name: "Dialog", path: "/material/dialog", iconText: "D" },
  //     { name: "Expansion Panel", path: "/material/expansion-panel", iconText: "E" },
  //     { name: "Form", path: "/material/form", iconText: "F" },
  //     { name: "Icons", path: "/material/icons", iconText: "I" },
  //     { name: "Menu", path: "/material/menu", iconText: "M" },
  //     { name: "Progress", path: "/material/progress", iconText: "P" },
  //     { name: "Radio", path: "/material/radio", iconText: "R" },
  //     { name: "Switch", path: "/material/switch", iconText: "S" },
  //     { name: "Slider", path: "/material/slider", iconText: "S" },
  //     { name: "Snackbar", path: "/material/snackbar", iconText: "S" },
  //     { name: "Table", path: "/material/table", iconText: "T" }
  //   ]
  // },
  // {
  //   name: "Charts",
  //   icon: "trending_up",
  //   children: [{ name: "Echarts", path: "/charts/echarts", iconText: "E" }]
  // },
  // {
  //   name: "Documentation",
  //   icon: "launch",
  //   type: "extLink",
  //   path: "http://demos.ui-lib.com/matx-react-doc/"
  // }
];
