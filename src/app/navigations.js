export const navigations = [
  {
    name: "Dashboard",
    path: "/dashboard/default",
    icon: "dashboard",
    users: ["admin", "editor", "viewer"]
  },
  // { name: "Dashboard", path: "/dashboard/default", icon: "dashboard" },
  // { label: "Produit", type: "label" },
  {
    name: "Produits",
    icon: "shopping_basket",
    children: [
      { name: "Liste Produits", iconText: "SI", path: "/produit/liste" },
      { name: "Ajouter Produit", iconText: "SU", path: "/produit/ajouter" }
    ],
    users: ["admin", "editor", "viewer"]
  },
  {
    name: "Commandes",
    icon: "shopping_cart",
    children: [
      { name: "Liste Commandes", iconText: "SI", path: "/commande/liste" },
      { name: "Commandes Livrés", iconText: "SI", path: "/commande/livre" }
    ],
    users: ["admin", "editor", "viewer"]
  },
  {
    name: "Achat",
    icon: "storefronttwotoneicon",
    children: [
      { name: "Nouveau Achat", iconText: "SI", path: "/achat/add" },
      { name: "List des Achat", iconText: "SI", path: "/achat/list" }
    ],
    users: ["admin", "editor", "viewer"]
  },
  {
    name: "Vente",
    icon: "selltwotone",
    children: [
      { name: "Nouveau Vente", iconText: "SI", path: "/vente/add" },
      { name: "List des Vente", iconText: "SI", path: "/vente/list" }
    ],
    users: ["admin", "editor", "viewer"]
  },
  { name: "Banners", path: "/banners", icon: "panorama", users: ["admin", "editor"] },
  {
    name: "Liste des abonnés",
    path: "/SubscriptionList",
    icon: "local_post_office",
    users: ["admin", "editor"]
  },
  { name: "Liste Des Avis", path: "/avis", icon: "sms", users: ["admin", "editor"] },
  {
    name: "Partenaire",
    path: "/partenaire/liste",
    icon: "account_box",
    users: ["admin", "editor"]
  },
  { name: "Promo", path: "/promo", icon: "shopping_basket", users: ["admin", "editor"] },
  { name: "Blog", path: "/blog", icon: "font_download", users: ["admin", "editor"] },
  {
    name: "Utilisateurs internes",
    path: "/internuser",
    icon: "contacts",
    users: ["admin", "editor"]
  },
  { name: "Les utilisateur", path: "/users", icon: "group", users: ["admin"] },
  {
    name: "Les réclamations",
    path: "/reclamation",
    icon: "question_answer",
    users: ["admin", "editor", "viewer"]
  }
];
